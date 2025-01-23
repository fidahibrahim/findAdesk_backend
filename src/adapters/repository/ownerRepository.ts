import { Model } from "mongoose";
import { IOwnerRepository } from "../../interface/Repository/ownerRepository";
import IOwner from "../../entities/ownerEntity";
import { IRegisterBody } from "../../interface/Controller/IUserController";
import { IOtp } from "../../entities/otpEntity";

export default class ownerRepository implements IOwnerRepository {
    private owner: Model<IOwner>
    private otp: Model<IOtp>
    constructor(
        owner: Model<IOwner>,
        otp: Model<IOtp>
    ) {
        this.owner = owner
        this.otp = otp
    }
    async createOwner(data: IRegisterBody) {
        try {
            const owner = new this.owner(data)
            return await owner.save()
        } catch (error) {
            console.log(error)
            throw new Error("Failed to create new Owner")
        }
    }
    async checkEmailExists(email: string) {
        try {
            return await this.owner.findOne({ email })
        } catch (error) {
            console.log(error)
            throw new Error("Failed to check email existence")
        }
    }
    
    async checkOwnerExists(id: string) {
        try {
            return await this.owner.findById(id)
        } catch (error) {
            console.log(error)
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
    async updateOwnerVerified(email: string) {
        try {
            return await this.owner.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true }
            )
        } catch (error) {
            throw new Error("Failed to update user verified ");
        }
    }
}