import { IuserRepository } from "../../interface/Repository/userRepository";
import { IRegisterBody } from "../../interface/Controller/IUserController"
import { Model } from "mongoose";
import Iuser from "../../entities/userEntity"
import { IOtp } from "../../entities/otpEntity"
import { GoogleProfileResponse, Ifilter } from "../../interface/Usecase/IUserUseCase";
import { IWorkspace } from "../../entities/workspaceEntity";


export default class userRepository implements IuserRepository {
    private user: Model<Iuser>
    private otp: Model<IOtp>
    private workspace: Model<IWorkspace>
    constructor(
        user: Model<Iuser>,
        otp: Model<IOtp>,
        workspace: Model<IWorkspace>
    ) {
        this.user = user
        this.otp = otp
        this.workspace = workspace
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
    async getProfile(userId: string) {
        try {
            const response = await this.user.findById(userId)
            return response
        } catch (error) {
            throw error
        }
    }
    async getRecentWorkspaces() {
        try {
            return await this.workspace
                .find()
                .sort({ createdAt: -1 })
                .limit(6)
                .exec();
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
            if (filters.date) {
                const searchDate = new Date(filters.date);
                query.startTime = { $lte: searchDate };
                query.endTime = { $gte: searchDate };
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
            // query.status = "Approved";
            return await this.workspace.find(query).sort(sortOptions)

        } catch (error) {
            throw error
        }
    }
    async workspaceDetails(workspaceId: string) {
        try {
            const response = await this.workspace.findById(workspaceId)
            console.log(response, "response from repository")
            return response
        } catch (error) {
            throw error
        }
    }
}