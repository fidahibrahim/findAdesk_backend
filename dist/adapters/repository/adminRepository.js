"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class adminRepository {
    constructor(admin, user) {
        this.admin = admin;
        this.user = user;
    }
    async checkEmailExists(email) {
        try {
            return await this.admin.findOne({ email, isAdmin: true });
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async getAllUsers() {
        try {
            const users = await this.user.find({ isAdmin: false }).sort({ _id: -1 });
            return users || null;
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
}
exports.default = adminRepository;
//# sourceMappingURL=adminRepository.js.map