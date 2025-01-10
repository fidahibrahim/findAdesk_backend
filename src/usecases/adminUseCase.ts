import { IadminUseCase, returnData } from "../interface/Usecase/IadminUseCase";
import IadminRepository from "../interface/Repository/adminRepository";
import IhashingService from "../interface/Utils/hashingService"
import IjwtService from "../interface/Utils/jwtService"


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
    async getUsers() {
        try {
            const users = this.adminRepository.getAllUsers()
            return users
        } catch (error) {
            console.log(error);
        }
    }
}