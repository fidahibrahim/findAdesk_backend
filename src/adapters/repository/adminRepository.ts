import { Model } from "mongoose";
import IadminRepository from "../../interface/Repository/adminRepository";
import Iuser from "../../entities/userEntity";
import IOwner from "../../entities/ownerEntity";
import { IWorkspace } from "../../entities/workspaceEntity";
import { IBooking } from "../../entities/bookingEntity";

export default class adminRepository implements IadminRepository {
    private admin: Model<Iuser>
    private user: Model<Iuser>
    private owner: Model<IOwner>
    private workspace: Model<IWorkspace>
    private booking: Model<IBooking>
    constructor(
        admin: Model<Iuser>,
        user: Model<Iuser>,
        owner: Model<IOwner>,
        workspace: Model<IWorkspace>,
        booking: Model<IBooking>
    ) {
        this.admin = admin
        this.user = user
        this.owner = owner
        this.workspace = workspace
        this.booking = booking
    }

    async checkEmailExists(email: string) {
        try {
            return await this.admin.findOne({ email, isAdmin: true })
        } catch (error) {
            return null
        }
    }
    async getAllUsers(search: string, page: number, limit: number): Promise<{ users: Iuser[]; totalCount: number }> {
        try {
            const filter = search
                ? { isAdmin: false, $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
                : { isAdmin: false };
            const users = await this.user
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            const totalCount = await this.user.countDocuments(filter);
            return { users, totalCount };
        } catch (error) {
            throw error
        }
    }
    async getUserCount() {
        try {
            const response = await this.user.countDocuments()
            console.log(response)
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }
    async getRecentUsers() {
        try {
            const users = await this.user.find().sort({ createdAt: -1 }).limit(3).lean();
            console.log(users)
            return users;
        } catch (error) {
            console.log(error)
            throw error
        }
    }
    async blockOrUnBlockUser(userId: string): Promise<Iuser | null> {
        try {
            const user = await this.user.findById(userId)
            return await this.user.findByIdAndUpdate(
                { _id: user?._id },
                { $set: { isBlocked: !user?.isBlocked } },
                { new: true }
            )
        } catch (error) {
            return null
        }
    }
    async getAllOwners(search: string, page: number, limit: number): Promise<{ owners: IOwner[]; totalCount: number; }> {
        try {
            const filter = search
                ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
                : {};
            const owners = await this.owner
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            const totalCount = await this.owner.countDocuments(filter)
            return { owners, totalCount }
        } catch (error) {
            throw new Error("Error fetching owners from database")
        }
    }
    async checkUserExists(id: string) {
        try {
            return await this.admin.findOne({ _id: id })
        } catch (error) {
            throw new Error("Failed to check the admin exists")
        }
    }
    async blockOrUnBlockOwner(ownerId: string): Promise<IOwner | null> {
        try {
            const owner = await this.owner.findById(ownerId)
            return await this.owner.findByIdAndUpdate(
                { _id: owner?._id },
                { $set: { isBlocked: !owner?.isBlocked } },
                { new: true }
            )
        } catch (error) {
            return null
        }
    }
    async findWorkspace(workspaceId: string) {
        try {
            const response = await this.workspace.findById(workspaceId)
            return response
        } catch (error) {
            throw error
        }
    }

    async getWorkspaces(search: string, page: number, limit: number, status?: string) {
        try {
            let filter: any = {}
            if (search) {
                filter.$or = [
                    { workspaceName: { $regex: search, $options: "i" } },
                    { workspaceMail: { $regex: search, $options: "i" } }
                ];
            }
            if (status && status !== 'all') {
                filter.status = { $regex: new RegExp(`^${status}$`, 'i') }
            }
            const workspaces = await this.workspace
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            const totalCount = await this.workspace.countDocuments(filter)
            return { workspaces, totalCount }
        } catch (error) {
            throw error
        }
    }
    async getRecentWorkspaces() {
        try {
            const response = await this.workspace.find().sort({ createdAt: -1 }).limit(3).lean()
            return response
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async getWorkspaceCount() {
        try {
            const response = await this.workspace.countDocuments()
            return response
        } catch (error) {
            throw error
        }
    }

    async updateStatus(workspaceId: string, status: string) {
        try {
            const updatedWorkspace = await this.workspace.findByIdAndUpdate(
                workspaceId,
                { status },
                { new: true }
            )
            if (!updatedWorkspace) {
                throw new Error(`Workspace with ID ${workspaceId} not found`);
            }
            return updatedWorkspace;
        } catch (error) {
            throw error
        }
    }
    async workspaceDetails(workspaceId: string) {
        try {
            const response = await this.workspace.findById(workspaceId)
            return response
        } catch (error) {
            throw error
        }
    }
    async getServiceFeeSum(startDate: Date, endDate: Date) {
        try {
            const matchStage: { date?: { $gte: Date; $lte: Date }, status?: string } = { status: "completed" };
            if (startDate && endDate) {
                matchStage.date = { $gte: startDate, $lte: endDate };
            }
            if (startDate && endDate) {
                matchStage.date = { $gte: startDate, $lte: endDate };
            }
            const result = await this.booking.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalServiceFee: { $sum: "$serviceFee" }
                    }
                }
            ]);
            return result.length > 0 ? result[0].totalServiceFee : 0;

        } catch (error) {
            console.log(error)
            throw error
        }
    }
    async getAllBookings(page: number = 1, limit: number = 5) {
        try {
            const skip = (page - 1) * limit;
            return await this.booking.find()
                .populate('workspaceId', 'workspaceName workspaceMail')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
        } catch (error) {
            throw error
        }
    }
    async getAllBookingsCount() {
        try {
            return await this.booking.countDocuments();
        } catch (error) {
            throw error;
        }
    }
    async getBookingsWithinDateRange(startDate: Date, endDate: Date, page: number = 1, limit: number = 5) {
        try {
            const skip = (page - 1) * limit;
            return await this.booking.find({
                date: { $gte: startDate, $lte: endDate }
            })
                .populate('workspaceId', 'workspaceName workspaceMail')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

        } catch (error) {
            throw error
        }
    }
    async getBookingsCountWithinDateRange(startDate: Date, endDate: Date) {
        try {
            return await this.booking.countDocuments({
                date: { $gte: startDate, $lte: endDate }
            });
        } catch (error) {
            throw error;
        }
    }
    async calculateTotalRevenue() {
        try {
            const result = await this.booking.aggregate([
                {
                    $match: {
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalServiceFee: { $sum: '$serviceFee' }
                    }
                }
            ])
            return result.length > 0 ? result[0].totalServiceFee : 0;
        } catch (error) {
            throw error
        }
    }
    async getMonthlyRevenue(): Promise<any> {
        try {
            const currentYear = new Date().getFullYear();
            const result = await this.booking.aggregate([
                {
                    $match: {
                        status: 'completed',
                        startTime: {
                            $gte: new Date(`${currentYear}-01-01`),
                            $lte: new Date(`${currentYear}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$startTime" },
                        revenue: { $sum: "$serviceFee" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ])
            const monthlyData = Array(12).fill(0);
            result.forEach(item => {
                monthlyData[item._id - 1] = item.revenue;
            });

            return monthlyData;
        } catch (error) {
            throw error
        }
    }
    async getYearlyRevenue(): Promise<any> {
        try {
            const currentYear = new Date().getFullYear();
            const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
            const result = await this.booking.aggregate([
                {
                    $match: {
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
                        revenue: { $sum: "$serviceFee" }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ])
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

