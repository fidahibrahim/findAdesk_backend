import { IadminUseCase, returnData } from "../interface/Usecase/IadminUseCase";
import IadminRepository from "../interface/Repository/adminRepository";
import IhashingService from "../interface/Utils/hashingService"
import IjwtService from "../interface/Utils/jwtService"
import Iuser from "../entities/userEntity";
import IOwner from "../entities/ownerEntity";
import IotpService from "../interface/Utils/otpService";
import { IBookingRepository } from "../interface/Repository/bookingRepository";
import { IWorkspace } from "../entities/workspaceEntity";


export default class adminUseCase implements IadminUseCase {
    private adminRepository: IadminRepository
    private bookingRepository: IBookingRepository
    private hashingService: IhashingService
    private jwtService: IjwtService
    private otpService: IotpService
    constructor(
        adminRepository: IadminRepository,
        bookingRepository: IBookingRepository,
        hashingService: IhashingService,
        jwtService: IjwtService,
        otpService: IotpService,

    ) {
        this.adminRepository = adminRepository
        this.bookingRepository = bookingRepository
        this.hashingService = hashingService
        this.jwtService = jwtService
        this.otpService = otpService
    }

    async login(email: string, password: string): Promise<returnData | void> {
        try {
            const admin = await this.adminRepository.checkEmailExists(email)
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
            }
            return {
                message: "Logined successfully",
                token,
                adminRefreshToken,
                admin: filteredData
            };
        } catch (error) {
            console.log(error);
        }
    }
    async getUsers(search: string, page: number, limit: number): Promise<{ users: Iuser[]; totalPages: number }> {
        try {
            const { users, totalCount } = await this.adminRepository.getAllUsers(search, page, limit)
            const totalPages = Math.ceil(totalCount / limit);
            return { users, totalPages };
        } catch (error) {
            console.log(error);
            return { users: [], totalPages: 0 };
        }
    }
    async blockUser(userId: string) {
        try {
            const response = await this.adminRepository.blockOrUnBlockUser(userId)
            if (response?.isBlocked) {
                return "blocked successfully";
            } else {
                return "unblocked successfully";
            }
        } catch (error) {
            return null
        }
    }

    async getOwners(search: string, page: number, limit: number): Promise<{ owners: IOwner[]; totalPages: number; }> {
        try {
            const { owners, totalCount } = await this.adminRepository.getAllOwners(search, page, limit)
            const totalPages = Math.ceil(totalCount / limit)
            return { owners, totalPages }
        } catch (error) {
            return { owners: [], totalPages: 0 }
        }
    }

    async blockOwner(ownerId: string): Promise<string | null> {
        try {
            const response = await this.adminRepository.blockOrUnBlockOwner(ownerId)
            if (response?.isBlocked) {
                return "blocked successfully";
            } else {
                return "unblocked successfully";
            }
        } catch (error) {
            return null
        }
    }

    async getWorkspaces(search: string, page: number, limit: number, status?: string) {
        try {
            const { workspaces, totalCount } = await this.adminRepository.getWorkspaces(search, page, limit, status)
            const totalPages = Math.ceil(totalCount / limit)
            return { workspaces, totalPages }
        } catch (error) {
            throw error
        }
    }

    async updateStatus(workspaceId: string, status: string) {
        try {
            const existWorkspace = await this.adminRepository.findWorkspace(workspaceId)
            let email = existWorkspace?.workspaceMail
            const response = await this.adminRepository.updateStatus(workspaceId, status)
            if (response) {
                await this.otpService.sendEmailToOwner(email, response.status, response.workspaceName)
                return response
            }
        } catch (error) {

        }
    }

    async workspaceDetails(workspaceId: string) {
        try {
            const response = await this.adminRepository.workspaceDetails(workspaceId)
            return response
        } catch (error) {
            throw error
        }
    }

    async getAdminRevenue(filter: string, page: number = 1, limit: number = 5) {
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
                } else {
                    filteredRevenue = totalRevenue;
                    totalCount = await this.adminRepository.getAllBookingsCount();
                    bookings = await this.adminRepository.getAllBookings(page, limit);
                }
            } else {
                filteredRevenue = totalRevenue;
                totalCount = await this.adminRepository.getAllBookingsCount();
                bookings = await this.adminRepository.getAllBookings(page, limit);
            }

            return { totalRevenue, filteredRevenue, bookings, totalCount };
        } catch (error) {
            throw error
        }
    }
    async getUserCount() {
        try {
            const response = await this.adminRepository.getUserCount()
            return response
        } catch (error) {
            throw error
        }
    }
    async getWorkspaceCount() {
        try {
            const response = await this.adminRepository.getWorkspaceCount()
            return response
        } catch (error) {
            throw error
        }
    }
    async getRecentUsers() {
        try {
            const response = await this.adminRepository.getRecentUsers()
            return response
        } catch (error) {
            throw error
        }
    }
    async getRecentWorkspaces() {
        try {
            const response = await this.adminRepository.getRecentWorkspaces()
            return response
        } catch (error) {
            throw error
        }
    }
    async getTotalRevenue() {
        try {
            const totalRevenue = await this.adminRepository.calculateTotalRevenue();
            return totalRevenue;
        } catch (error) {
            throw error
        }
    }
    async getMonthlyRevenue() {
        try {
            const monthlyRevenue = await this.adminRepository.getMonthlyRevenue();
            return monthlyRevenue;
        } catch (error) {
            throw error
        }
    }
    async getYearlyRevenue(): Promise<any> {
        try {
            const yearlyRevenue = await this.adminRepository.getYearlyRevenue();
            return yearlyRevenue;
        } catch (error) {
            throw error
        }
    }
}