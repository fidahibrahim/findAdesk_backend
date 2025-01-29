import { IuserRepository } from "../../interface/Repository/userRepository";
import { IRegisterBody } from "../../interface/Controller/IUserController"
import { Model } from "mongoose";
import Iuser from "../../entities/userEntity"
import { IOtp } from "../../entities/otpEntity"
import { GoogleProfileResponse } from "../../interface/Usecase/IUserUseCase";

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
            throw error
        }
    }
    async checkEmailExists(email: string) {
        try {
            return await this.user.findOne({ email })
        } catch (error) {
            throw error
        }
    }
    async saveOtp(email: string, otp: string) {
        try {
            await this.otp.deleteMany({ email });
            const newOtp = new this.otp({ email, otp });
            await newOtp.save()
        } catch (error) {
            throw error
        }
    }
    async verifyOtp(email: string) {
        try {
            return await this.otp.findOne({ email })
        } catch (error) {
            throw error
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
            throw error
        }
    }
    async googleUser(data: GoogleProfileResponse) {
        try {
            const existUser = await this.user.findOne({ email: data.email })
            let user
            if(!existUser) {
                const newUser = new this.user({
                    name: data.name,
                    email: data.email,
                    image: data.picture,
                    isVerified: true
                })
                user = await newUser.save()
                console.log("user neeew", user)
            } else {
                user = existUser
            }
            return user
        } catch (error) {
            throw error
        }
    }
}