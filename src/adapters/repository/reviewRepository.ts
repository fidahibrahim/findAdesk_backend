import { Model, Types } from "mongoose";
import { AddReviewRequest, IReview, PopulatedReview } from "../../entities/reviewEntity";
import { IReviewRepository } from "../../interface/Repository/reviewRepository";
import { IBooking } from "../../entities/bookingEntity";

export default class reviewRepository implements IReviewRepository {
    private review: Model<IReview>;
    private booking: Model<IBooking>

    constructor(review: Model<IReview>, booking: Model<IBooking>) {
        this.review = review,
            this.booking = booking
    }

    async findByWorkspaceId(workspaceId: string) {
        try {
            return await this.review.findOne({ workspaceId })
                .populate('workspaceId', 'workspaceName')
                .populate('bookingId')
                .populate('ratings.userId', 'firstName lastName profileImage')
                .lean();
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async findByBookingId(bookingId: string) {
        try {
            const review = await this.review.findOne({ bookingId });
            return review
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async addReview(reviewData: AddReviewRequest) {
        try {
            const { workspaceId, bookingId, userId, rating, review } = reviewData;
            const booking = await this.booking.findOne({ bookingId })
            const bookingObjectId = booking?._id
            const existingReview = await this.review.findOne({ workspaceId })
            if (existingReview) {
                const userReviewIndex = existingReview.ratings.findIndex(
                    r => r.userId.toString() === userId
                );

                if (userReviewIndex !== -1) {
                    existingReview.ratings[userReviewIndex] = {
                        userId: new Types.ObjectId(userId),
                        rating,
                        review,
                        createdAt: new Date()
                    }
                } else {
                    existingReview.ratings.push({
                        userId: new Types.ObjectId(userId),
                        rating,
                        review,
                        createdAt: new Date()
                    });
                }
                existingReview.bookingId = bookingObjectId!;
                await existingReview.save();
                return existingReview;
            } else {
                const newReview = await this.review.create({
                    workspaceId: workspaceId,
                    bookingId: bookingObjectId,
                    ratings: [{
                        userId: userId,
                        rating,
                        review,
                        createdAt: new Date()
                    }]
                })
                return newReview
            }
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async updateReview(reviewData: AddReviewRequest) {
        try {
            const { workspaceId, userId, rating, review } = reviewData;
            const updatedReview = await this.review.findOneAndUpdate({
                workspaceId: workspaceId,
                'ratings.userId': userId
            },
                {
                    $set: {
                        'ratings.$.rating': rating,
                        'ratings.$.review': review,
                        'ratings.$.createdAt': new Date()
                    }
                },
                { new: true }
            )
                .populate('workspaceId', 'workspaceName')
                .populate('bookingId')
                .populate('ratings.userId', 'firstName lastName profileImage');
            return updatedReview
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async getReviews(workspaceId: string) {
        try {
            const reviewData = await this.review.findOne({ workspaceId })
                .populate({
                    path: 'ratings.userId',
                    select: 'name image',
                    model: 'User'
                })
                .lean() as PopulatedReview | null;
            if (!reviewData) {
                return null;
            }
            const totalRatings = reviewData?.ratings.length;
            const sumRatings = reviewData?.ratings.reduce((sum, item) => sum + item.rating, 0);
            const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

            const transformedData = {
                ...reviewData,
                averageRating,
                ratings: reviewData.ratings?.map(rating => {
                    return {
                        ...rating,
                        userId: {
                            firstName: rating.userId.name,
                            lastName: "", 
                            profileImage: rating.userId.image
                        }
                    };
                }) || []
            };

            return transformedData;
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}