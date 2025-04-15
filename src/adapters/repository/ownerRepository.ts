import { Model, Types } from "mongoose";
import { IOwnerRepository } from "../../interface/Repository/ownerRepository";
import IOwner from "../../entities/ownerEntity";
import { IRegisterBody } from "../../interface/Controller/IUserController";
import { IOtp } from "../../entities/otpEntity";
import { IWorkspace } from "../../entities/workspaceEntity";
import { IBooking } from "../../entities/bookingEntity";

export default class ownerRepository implements IOwnerRepository {
    private owner: Model<IOwner>
    private otp: Model<IOtp>
    private workspace: Model<IWorkspace>
    private booking: Model<IBooking>
    constructor(
        owner: Model<IOwner>,
        otp: Model<IOtp>,
        workspace: Model<IWorkspace>,
        booking: Model<IBooking>
    ) {
        this.owner = owner
        this.otp = otp
        this.workspace = workspace
        this.booking = booking
    }
    async createOwner(data: IRegisterBody) {
        try {
            const owner = new this.owner(data)
            return await owner.save()
        } catch (error) {
            throw new Error("Failed to create new Owner")
        }
    }
    async checkEmailExists(email: string) {
        try {
            return await this.owner.findOne({ email })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to check email existence")
        }
    }
    async checkOwnerExists(id: string) {
        try {
            return await this.owner.findById(id)
        } catch (error) {
            throw new Error("Failed to check email existence")
        }
    }

    async saveOtp(email: string, otp: string) {
        try {
            await this.otp.deleteMany({ email });
            const newOtp = new this.otp({ email, otp });
            await newOtp.save()
        } catch (error) {
            throw new Error("Failed to store Otp")
        }
    }
    async verifyOtp(email: string) {
        try {
            return await this.otp.findOne({ email })
        } catch (error) {
            throw new Error("Failed to OTP")
        }
    }
    async updateOwnerVerified(email: string) {
        try {
            return await this.owner.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true }
            )
        } catch (error) {
            throw new Error("Failed to update user verified ");
        }
    }
    async getWorkspaceCount(ownerId: string) {
        try {
            return await this.workspace.countDocuments({ ownerId: new Types.ObjectId(ownerId) })
        } catch (error) {
            throw error
        }
    }
    async getBookingCount(ownerId: string) {
        try {
            return await this.booking.countDocuments({ workspaceOwnerId: new Types.ObjectId(ownerId) })
        } catch (error) {
            throw error
        }
    }
    async getTotalRevenue(ownerId: string) {
        try {
            const result = await this.booking.aggregate([
                {
                    $match: {
                        workspaceOwnerId: new Types.ObjectId(ownerId),
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$subTotal' }
                    }
                }
            ]);
            return result.length > 0 ? result[0].totalRevenue : 0;
        } catch (error) {
            throw error
        }
    }
    async getRecentBookings(ownerId: string) {
        try {
            return await this.booking.find({ workspaceOwnerId: new Types.ObjectId(ownerId) }).sort({ createdAt: -1 }).limit(3).lean()
        } catch (error) {
            throw error
        }
    }
    async getRecentWorkspaces(ownerId: string) {
        try {
            return await this.workspace.find({ ownerId: new Types.ObjectId(ownerId) }).sort({ createdAt: -1 }).limit(3).lean()
        } catch (error) {
            throw error
        }
    }

    async getMonthlyRevenue(ownerId: string) {
        try {
            const currentYear = new Date().getFullYear();
            const result = await this.booking.aggregate([
                {
                    $match: {
                        workspaceOwnerId: new Types.ObjectId(ownerId),
                        status: 'completed',
                        createdAt: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        revenue: { $sum: "$subTotal" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
            const monthlyData = Array(12).fill(0);
            result.forEach(item => {
                monthlyData[item._id - 1] = item.revenue;
            });

            return monthlyData;
        } catch (error) {
            throw error
        }
    }
    async getYearlyRevenue(ownerId: string) {
        try {
            const currentYear = new Date().getFullYear();
            const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
            const result = await this.booking.aggregate([
                {
                    $match: {
                        workspaceOwnerId: new Types.ObjectId(ownerId),
                        status: 'completed',
                        startTime: {
                            $gte: new Date(`${years[0]}-01-01`),
                            $lte: new Date(`${years[4]}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $year: "$startTime" },
                        revenue: { $sum: "$subTotal" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);
            const yearlyData = Array(5).fill(0);
            result.forEach(item => {
                const index = years.indexOf(item._id);
                if (index !== -1) {
                    yearlyData[index] = item.revenue;
                }
            });

            return yearlyData;
        } catch (error) {
            throw error
        }
    }
}