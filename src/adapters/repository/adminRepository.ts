import { Model } from "mongoose";
import IadminRepository from "../../interface/Repository/adminRepository";
import Iuser from "../../entities/userEntity";

export default class adminRepository implements IadminRepository  {
    private admin: Model<Iuser>
    private user: Model<Iuser>
    constructor(
        admin: Model<Iuser>,
        user: Model<Iuser>
    ){
        this.admin = admin
        this.user = user
    }

    async checkEmailExists(email: string) {
        try {
            return await this.admin.findOne({ email, isAdmin: true })
        } catch (error) {
            console.log(error);
            return null
        }
    }
    async getAllUsers(): Promise<Iuser[]|[]> {
        try {
            const users = await this.user.find({ isAdmin: false }).sort({ _id: -1 })
            return users || null
        } catch (error) {
            console.log(error);
            return []
        }
    }
}