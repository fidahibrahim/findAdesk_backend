"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class adminUseCase {
    constructor(adminRepository, hashingService, jwtService) {
        this.adminRepository = adminRepository;
        this.hashingService = hashingService;
        this.jwtService = jwtService;
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
    async getUsers() {
        try {
            const users = this.adminRepository.getAllUsers();
            return users;
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = adminUseCase;
//# sourceMappingURL=adminUseCase.js.map