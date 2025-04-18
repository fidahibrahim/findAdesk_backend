"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
class reviewRepository {
    constructor(review, booking, workspace) {
        this.review = review,
            this.booking = booking,
            this.workspace = workspace;
    }
    async findByWorkspaceId(workspaceId) {
        try {
            return await this.review.findOne({ workspaceId })
                .populate('workspaceId', 'workspaceName')
                .populate('bookingId')
                .populate('ratings.userId', 'firstName lastName profileImage')
                .lean();
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async findByBookingId(bookingId) {
        try {
            const review = await this.review.findOne({ bookingId });
            return review;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async addReview(reviewData) {
        try {
            const { workspaceId, bookingId, userId, rating, review } = reviewData;
            const booking = await this.booking.findOne({ bookingId });
            const bookingObjectId = booking === null || booking === void 0 ? void 0 : booking._id;
            const existingReview = await this.review.findOne({ workspaceId });
            if (existingReview) {
                const userReviewIndex = existingReview.ratings.findIndex(r => r.userId.toString() === userId);
                if (userReviewIndex !== -1) {
                    existingReview.ratings[userReviewIndex] = {
                        userId: new mongoose_1.Types.ObjectId(userId),
                        rating,
                        review,
                        createdAt: new Date()
                    };
                }
                else {
                    existingReview.ratings.push({
                        userId: new mongoose_1.Types.ObjectId(userId),
                        rating,
                        review,
                        createdAt: new Date()
                    });
                }
                existingReview.bookingId = bookingObjectId;
                await existingReview.save();
                return existingReview;
            }
            else {
                const newReview = await this.review.create({
                    workspaceId: workspaceId,
                    bookingId: bookingObjectId,
                    ratings: [{
                            userId: userId,
                            rating,
                            review,
                            createdAt: new Date()
                        }]
                });
                return newReview;
            }
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateReview(reviewData) {
        try {
            const { workspaceId, userId, rating, review } = reviewData;
            const updatedReview = await this.review.findOneAndUpdate({
                workspaceId: workspaceId,
                'ratings.userId': userId
            }, {
                $set: {
                    'ratings.$.rating': rating,
                    'ratings.$.review': review,
                    'ratings.$.createdAt': new Date()
                }
            }, { new: true })
                .populate('workspaceId', 'workspaceName')
                .populate('bookingId')
                .populate('ratings.userId', 'firstName lastName profileImage');
            return updatedReview;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async getReviews(workspaceId) {
        var _a;
        try {
            const reviewData = await this.review.findOne({ workspaceId })
                .populate({
                path: 'ratings.userId',
                select: 'name image',
                model: 'User'
            })
                .lean();
            if (!reviewData) {
                return null;
            }
            const totalRatings = reviewData === null || reviewData === void 0 ? void 0 : reviewData.ratings.length;
            const sumRatings = reviewData === null || reviewData === void 0 ? void 0 : reviewData.ratings.reduce((sum, item) => sum + item.rating, 0);
            const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
            const transformedData = {
                ...reviewData,
                averageRating,
                ratings: ((_a = reviewData.ratings) === null || _a === void 0 ? void 0 : _a.map(rating => {
                    return {
                        ...rating,
                        userId: {
                            firstName: rating.userId.name,
                            lastName: "",
                            profileImage: rating.userId.image
                        }
                    };
                })) || []
            };
            return transformedData;
        }
        catch (error) {
            throw error;
        }
    }
    async getWorkspaceReviews(ownerId) {
        try {
            const workspaces = await this.workspace.find({ ownerId: new mongoose_1.Types.ObjectId(ownerId) });
            const workspaceIds = workspaces.map(workspace => workspace._id);
            const reviews = await this.review.find({
                workspaceId: { $in: workspaceIds }
            }).populate({
                path: 'ratings.userId',
                select: 'name email image'
            });
            const reviewMap = new Map();
            reviews.forEach(review => {
                reviewMap.set(review.workspaceId.toString(), review.ratings);
            });
            const workspacesWithReviews = workspaces.map(workspace => {
                const workspaceObj = workspace.toObject();
                const workspaceId = workspace._id.toString();
                const formattedReviews = (reviewMap.get(workspaceId) || []).map((rating) => ({
                    userId: rating.userId,
                    rating: rating.rating,
                    review: rating.review || '',
                    createdAt: rating.createdAt
                }));
                return {
                    ...workspaceObj,
                    reviews: formattedReviews
                };
            });
            return workspacesWithReviews;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = reviewRepository;
//# sourceMappingURL=reviewRepository.js.map