import { IuserRepository } from "../../interface/Repository/userRepository";
import { IRegisterBody } from "../../interface/Controller/IUserController"
import { Model } from "mongoose";
import Iuser from "../../entities/userEntity"
import { IOtp } from "../../entities/otpEntity"
import { GoogleProfileResponse, Ifilter } from "../../interface/Usecase/IUserUseCase";
import { IWorkspace } from "../../entities/workspaceEntity";
import { ISavedWorkspace } from "../../entities/savedWorkspaceEntity";
import { IReview } from "../../entities/reviewEntity";
interface RatingInfo {
    averageRating: number;
    totalRatings: number;
}

export default class userRepository implements IuserRepository {
    private user: Model<Iuser>
    private otp: Model<IOtp>
    private workspace: Model<IWorkspace>
    private savedWorkspace: Model<ISavedWorkspace>
    private review: Model<IReview>
    constructor(
        user: Model<Iuser>,
        otp: Model<IOtp>,
        workspace: Model<IWorkspace>,
        savedWorkspace: Model<ISavedWorkspace>,
        review: Model<IReview>
    ) {
        this.user = user
        this.otp = otp
        this.workspace = workspace
        this.savedWorkspace = savedWorkspace
        this.review = review
    }
    async createUser(data: IRegisterBody) {
        try {
            const user = new this.user(data)
            return await user.save()
        } catch (error) {
            throw error
        }
    }
    async checkEmailExists(email: string) {
        try {
            return await this.user.findOne({ email })
        } catch (error) {
            throw error
        }
    }
    async findById(userId: string) {
        try {
            return await this.user.findById(userId)
        } catch (error) {
            throw error
        }
    }
    async saveOtp(email: string, otp: string) {
        try {
            await this.otp.deleteMany({ email });
            const newOtp = new this.otp({ email, otp });
            await newOtp.save()
        } catch (error) {
            throw error
        }
    }
    async verifyOtp(email: string) {
        try {
            return await this.otp.findOne({ email })
        } catch (error) {
            throw error
        }
    }
    async updateUserVerified(email: string) {
        try {
            return await this.user.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true }
            )
        } catch (error) {
            throw error
        }
    }
    async googleUser(data: GoogleProfileResponse) {
        try {
            const existUser = await this.user.findOne({ email: data.email })
            let user
            if (!existUser) {
                const newUser = new this.user({
                    name: data.name,
                    email: data.email,
                    image: data.picture,
                    isVerified: true
                })
                user = await newUser.save()
            } else {
                user = existUser
            }
            return user
        } catch (error) {
            throw error
        }
    }
    async changePassword(userId: string, password: string) {
        try {
            return await this.user.findByIdAndUpdate(userId, { password: password }, { new: true })
        } catch (error) {
            throw error
        }
    }
    async getProfile(userId: string) {
        try {
            const response = await this.user.findById(userId)
            return response
        } catch (error) {
            throw error
        }
    }
    async updateProfile(data: Iuser | null) {
        try {
            if (!data) throw new Error("Invalid user data");
            const updatedUser = await this.user.findOneAndUpdate(
                { email: data.email },
                {
                    $set: {
                        name: data.name,
                        email: data.email,
                        image: data.image
                    }
                },
                { new: true }
            )
            return updatedUser
        } catch (error) {
            throw error
        }
    }
    async resetPassword(userId: string, newPassword: string) {
        try {
            if (!userId) throw new Error("Invalid user data");
            const updatedUser = await this.user.findOneAndUpdate(
                { _id: userId },
                {
                    $set: {
                        password: newPassword
                    }
                },
                { new: true }
            )
            console.log(updatedUser, "updatedUser in repo")
            return updatedUser
        } catch (error) {
            throw error
        }
    }
    async getRecentWorkspaces() {
        try {
            const workspaces = await this.workspace
                .find()
                .sort({ createdAt: -1 })
                .limit(6)
                .exec();

            const workspaceIds = workspaces.map(workspace => workspace._id)
            const reviews = await this.review.aggregate([
                { $match: { workspaceId: { $in: workspaceIds } } },
                { $unwind: '$ratings' },
                {
                    $group: {
                        _id: '$workspaceId',
                        averageRating: { $avg: "$ratings.rating" },
                        totalRatings: { $sum: 1 }
                    }
                }
            ])
            const ratingsMap: Record<string, RatingInfo> = {};
            reviews.forEach(review => {
                ratingsMap[review._id.toString()] = {
                    averageRating: parseFloat(review.averageRating.toFixed(1)),
                    totalRatings: review.totalRatings
                };
            });

            const workspacesWithRatings = workspaces.map(workspace => {
                const workspaceId = workspace._id.toString();
                return {
                    ...workspace,
                    rating: ratingsMap[workspaceId] ? ratingsMap[workspaceId].averageRating : 0,
                    totalRatings: ratingsMap[workspaceId] ? ratingsMap[workspaceId].totalRatings : 0
                };
            });
            return workspacesWithRatings;
        } catch (error) {
            throw error
        }
    }
    async findWorkspaces(filters: Ifilter) {
        try {
            const query: any = {}
            const sortOptions: any = {}
            if (filters.type) query.workspaceType = filters.type;
            if (filters.location) {
                query.$or = [
                    { place: { $regex: filters.location, $options: "i" } },
                    { street: { $regex: filters.location, $options: "i" } },
                    { state: { $regex: filters.location, $options: "i" } }
                ];
            }
            if (filters.day) {
                const day = filters.day.toLowerCase();
                const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                const weekends = ['saturday', 'sunday'];

                let dayCategories = ['allDays'];
                if (weekdays.includes(day)) {
                    dayCategories.push('weekdays');
                } else if (weekends.includes(day)) {
                    dayCategories.push('weekends');
                }
                query.workingDays = { $in: dayCategories };
            }
            if (filters.amenities && filters.amenities.length > 0) {
                query.amenities = filters.amenities.length ?
                    { $all: filters.amenities.split(",").map(item => item.trim()) } :
                    undefined;
            }
            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'recommended':
                        sortOptions.createdAt = -1;
                        break;
                    case 'price-low':
                        sortOptions.pricePerHour = 1;
                        break;
                    case 'price-high':
                        sortOptions.pricePerHour = -1;
                        break;
                }
            }
            query.status = "Approved";
            return await this.workspace.find(query).sort(sortOptions)

        } catch (error) {
            throw error
        }
    }
    async workspaceDetails(workspaceId: string, userId?: string) {
        try {
            const workspace = await this.workspace.findById(workspaceId)
            const workspaceObject = workspace?.toObject() as IWorkspace;
            let isSaved = false;
            if (userId) {
                const savedWorkspace = await this.savedWorkspace.findOne({ userId, workspaceId, isActive: true })
                isSaved = !!savedWorkspace;
            }
            return { ...workspaceObject, isSaved }
        } catch (error) {
            throw error
        }
    }
    async updateUserMobile(userId: string, mobile: string) {
        try {
            await this.user.findByIdAndUpdate(userId, { mobile })
            return true
        } catch (error) {
            throw error
        }
    }
}