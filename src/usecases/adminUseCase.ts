import { IadminUseCase, returnData } from "../interface/Usecase/IadminUseCase";
import IadminRepository from "../interface/Repository/adminRepository";
import IhashingService from "../interface/Utils/hashingService"
import IjwtService from "../interface/Utils/jwtService"
import Iuser from "../entities/userEntity";
import IOwner from "../entities/ownerEntity";


export default class adminUseCase implements IadminUseCase {
    private adminRepository: IadminRepository
    private hashingService: IhashingService
    private jwtService: IjwtService
    constructor(
        adminRepository: IadminRepository,
        hashingService: IhashingService,
        jwtService: IjwtService,

    ) {
        this.adminRepository = adminRepository
        this.hashingService = hashingService
        this.jwtService = jwtService
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
            console.log(error)
            return null
        }
    }
    async getOwners(search: string, page: number, limit: number): Promise<{ owners: IOwner[]; totalPages: number; }> {
        try {
            const { owners, totalCount } = await this.adminRepository.getAllOwners(search, page, limit)
            const totalPages = Math.ceil(totalCount / limit)
            return { owners, totalPages }
        } catch (error) {
            console.log(error)
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
            console.log(error);
            return null
        }
    }
}