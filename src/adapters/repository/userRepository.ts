import { IuserRepository } from "../../interface/Repository/userRepository";
import { IRegisterBody } from "../../interface/Controller/IUserController"
import { Model } from "mongoose";
import Iuser from "../../entities/userEntity"
import { IOtp } from "../../entities/otpEntity"

export default class userRepository implements IuserRepository {
    private user: Model<Iuser>
    private otp: Model<IOtp>
    constructor(
        user: Model<Iuser>,
        otp: Model<IOtp>
    ) {
        this.user = user
        this.otp = otp
    }
    async createUser(data: IRegisterBody) {
        try {
            const user = new this.user(data)
            return await user.save()
        } catch (error) {
            throw new Error("Failed to create new User")
        }
    }
    async checkEmailExists(email: string) {
        try {
            console.log(email, "email in check");
            return await this.user.findOne({ email })
        } catch (error) {
            console.log(error);
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
    async updateUserVerified(email: string) {
        try {
            return await this.user.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true }
            )
        } catch (error) {
            throw new Error("Failed to update user verified ");
        }
    }
}