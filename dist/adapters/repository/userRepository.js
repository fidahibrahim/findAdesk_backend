"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class userRepository {
    constructor(user, otp) {
        this.user = user;
        this.otp = otp;
    }
    async createUser(data) {
        try {
            const user = new this.user(data);
            return await user.save();
        }
        catch (error) {
            throw new Error("Failed to create new User");
        }
    }
    async checkEmailExists(email) {
        try {
            console.log(email, "email in check");
            return await this.user.findOne({ email });
        }
        catch (error) {
            console.log(error);
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
    async updateUserVerified(email) {
        try {
            return await this.user.findOneAndUpdate({ email }, { $set: { isVerified: true } }, { new: true });
        }
        catch (error) {
            throw new Error("Failed to update user verified ");
        }
    }
}
exports.default = userRepository;
//# sourceMappingURL=userRepository.js.map