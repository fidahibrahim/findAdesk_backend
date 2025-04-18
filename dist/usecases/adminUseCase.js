"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class adminUseCase {
    constructor(adminRepository, bookingRepository, hashingService, jwtService, otpService) {
        this.adminRepository = adminRepository;
        this.bookingRepository = bookingRepository;
        this.hashingService = hashingService;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }
    async login(email, password) {
        try {
            const admin = await this.adminRepository.checkEmailExists(email);
            if (!admin) {
                return { message: "Invalid Email" };
            }
            const isPasswordValid = await this.hashingService.compare(password, admin.password);
            if (!isPasswordValid) {
                return { message: "Incorrect Password" };
            }
            const payload = {
                userId: admin._id,
                name: admin.name,
                role: "admin",
            };
            const token = this.jwtService.generateToken(payload);
            const adminRefreshToken = this.jwtService.generateRefreshToken(payload);
            const filteredData = {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
            };
            return {
                message: "Logined successfully",
                token,
                adminRefreshToken,
                admin: filteredData
            };
        }
        catch (error) {
            console.log(error);
        }
    }
    async getUsers(search, page, limit) {
        try {
            const { users, totalCount } = await this.adminRepository.getAllUsers(search, page, limit);
            const totalPages = Math.ceil(totalCount / limit);
            return { users, totalPages };
        }
        catch (error) {
            console.log(error);
            return { users: [], totalPages: 0 };
        }
    }
    async blockUser(userId) {
        try {
            const response = await this.adminRepository.blockOrUnBlockUser(userId);
            if (response === null || response === void 0 ? void 0 : response.isBlocked) {
                return "blocked successfully";
            }
            else {
                return "unblocked successfully";
            }
        }
        catch (error) {
            return null;
        }
    }
    async getOwners(search, page, limit) {
        try {
            const { owners, totalCount } = await this.adminRepository.getAllOwners(search, page, limit);
            const totalPages = Math.ceil(totalCount / limit);
            return { owners, totalPages };
        }
        catch (error) {
            return { owners: [], totalPages: 0 };
        }
    }
    async blockOwner(ownerId) {
        try {
            const response = await this.adminRepository.blockOrUnBlockOwner(ownerId);
            if (response === null || response === void 0 ? void 0 : response.isBlocked) {
                return "blocked successfully";
            }
            else {
                return "unblocked successfully";
            }
        }
        catch (error) {
            return null;
        }
    }
    async getWorkspaces(search, page, limit, status) {
        try {
            const { workspaces, totalCount } = await this.adminRepository.getWorkspaces(search, page, limit, status);
            const totalPages = Math.ceil(totalCount / limit);
            return { workspaces, totalPages };
        }
        catch (error) {
            throw error;
        }
    }
    async updateStatus(workspaceId, status) {
        try {
            const existWorkspace = await this.adminRepository.findWorkspace(workspaceId);
            let email = existWorkspace === null || existWorkspace === void 0 ? void 0 : existWorkspace.workspaceMail;
            const response = await this.adminRepository.updateStatus(workspaceId, status);
            if (response) {
                await this.otpService.sendEmailToOwner(email, response.status, response.workspaceName);
                return response;
            }
        }
        catch (error) {
        }
    }
    async workspaceDetails(workspaceId) {
        try {
            const response = await this.adminRepository.workspaceDetails(workspaceId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getAdminRevenue(filter, page = 1, limit = 5) {
        try {
            const totalRevenue = await this.adminRepository.getServiceFeeSum();
            let filteredRevenue;
            let bookings = [];
            let totalCount = 0;
            let startDate, endDate;
            if (filter) {
                const now = new Date();
                switch (filter.toLowerCase()) {
                    case 'daily':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                        break;
                    case 'weekly':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        endDate = now;
                        break;
                    case 'monthly':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                        break;
                    case 'yearly':
                        startDate = new Date(now.getFullYear(), 0, 1);
                        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                        break;
                    default:
                        filteredRevenue = totalRevenue;
                        break;
                }
                if (startDate && endDate) {
                    filteredRevenue = await this.adminRepository.getServiceFeeSum(startDate, endDate);
                    totalCount = await this.adminRepository.getBookingsCountWithinDateRange(startDate, endDate);
                    bookings = await this.adminRepository.getBookingsWithinDateRange(startDate, endDate, page, limit);
                }
                else {
                    filteredRevenue = totalRevenue;
                    totalCount = await this.adminRepository.getAllBookingsCount();
                    bookings = await this.adminRepository.getAllBookings(page, limit);
                }
            }
            else {
                filteredRevenue = totalRevenue;
                totalCount = await this.adminRepository.getAllBookingsCount();
                bookings = await this.adminRepository.getAllBookings(page, limit);
            }
            return { totalRevenue, filteredRevenue, bookings, totalCount };
        }
        catch (error) {
            throw error;
        }
    }
    async getUserCount() {
        try {
            const response = await this.adminRepository.getUserCount();
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getWorkspaceCount() {
        try {
            const response = await this.adminRepository.getWorkspaceCount();
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getRecentUsers() {
        try {
            const response = await this.adminRepository.getRecentUsers();
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getRecentWorkspaces() {
        try {
            const response = await this.adminRepository.getRecentWorkspaces();
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getTotalRevenue() {
        try {
            const totalRevenue = await this.adminRepository.calculateTotalRevenue();
            return totalRevenue;
        }
        catch (error) {
            throw error;
        }
    }
    async getMonthlyRevenue() {
        try {
            const monthlyRevenue = await this.adminRepository.getMonthlyRevenue();
            return monthlyRevenue;
        }
        catch (error) {
            throw error;
        }
    }
    async getYearlyRevenue() {
        try {
            const yearlyRevenue = await this.adminRepository.getYearlyRevenue();
            return yearlyRevenue;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = adminUseCase;
//# sourceMappingURL=adminUseCase.js.map