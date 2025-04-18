"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
class ownerRepository {
    constructor(owner, otp, workspace, booking) {
        this.owner = owner;
        this.otp = otp;
        this.workspace = workspace;
        this.booking = booking;
    }
    async createOwner(data) {
        try {
            const owner = new this.owner(data);
            return await owner.save();
        }
        catch (error) {
            throw new Error("Failed to create new Owner");
        }
    }
    async checkEmailExists(email) {
        try {
            return await this.owner.findOne({ email });
        }
        catch (error) {
            console.log(error);
            throw new Error("Failed to check email existence");
        }
    }
    async checkOwnerExists(id) {
        try {
            return await this.owner.findById(id);
        }
        catch (error) {
            throw new Error("Failed to check email existence");
        }
    }
    async saveOtp(email, otp) {
        try {
            await this.otp.deleteMany({ email });
            const newOtp = new this.otp({ email, otp });
            await newOtp.save();
        }
        catch (error) {
            throw new Error("Failed to store Otp");
        }
    }
    async verifyOtp(email) {
        try {
            return await this.otp.findOne({ email });
        }
        catch (error) {
            throw new Error("Failed to OTP");
        }
    }
    async updateOwnerVerified(email) {
        try {
            return await this.owner.findOneAndUpdate({ email }, { $set: { isVerified: true } }, { new: true });
        }
        catch (error) {
            throw new Error("Failed to update user verified ");
        }
    }
    async getWorkspaceCount(ownerId) {
        try {
            return await this.workspace.countDocuments({ ownerId: new mongoose_1.Types.ObjectId(ownerId) });
        }
        catch (error) {
            throw error;
        }
    }
    async getBookingCount(ownerId) {
        try {
            return await this.booking.countDocuments({ workspaceOwnerId: new mongoose_1.Types.ObjectId(ownerId) });
        }
        catch (error) {
            throw error;
        }
    }
    async getTotalRevenue(ownerId) {
        try {
            const result = await this.booking.aggregate([
                {
                    $match: {
                        workspaceOwnerId: new mongoose_1.Types.ObjectId(ownerId),
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
        }
        catch (error) {
            throw error;
        }
    }
    async getRecentBookings(ownerId) {
        try {
            return await this.booking.find({ workspaceOwnerId: new mongoose_1.Types.ObjectId(ownerId) }).sort({ createdAt: -1 }).limit(3).lean();
        }
        catch (error) {
            throw error;
        }
    }
    async getRecentWorkspaces(ownerId) {
        try {
            return await this.workspace.find({ ownerId: new mongoose_1.Types.ObjectId(ownerId) }).sort({ createdAt: -1 }).limit(3).lean();
        }
        catch (error) {
            throw error;
        }
    }
    async getMonthlyRevenue(ownerId) {
        try {
            const currentYear = new Date().getFullYear();
            const result = await this.booking.aggregate([
                {
                    $match: {
                        workspaceOwnerId: new mongoose_1.Types.ObjectId(ownerId),
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
        }
        catch (error) {
            throw error;
        }
    }
    async getYearlyRevenue(ownerId) {
        try {
            const currentYear = new Date().getFullYear();
            const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
            const result = await this.booking.aggregate([
                {
                    $match: {
                        workspaceOwnerId: new mongoose_1.Types.ObjectId(ownerId),
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
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = ownerRepository;
//# sourceMappingURL=ownerRepository.js.map