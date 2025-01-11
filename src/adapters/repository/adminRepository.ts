import { Model } from "mongoose";
import IadminRepository from "../../interface/Repository/adminRepository";
import Iuser from "../../entities/userEntity";

export default class adminRepository implements IadminRepository {
    private admin: Model<Iuser>
    private user: Model<Iuser>
    constructor(
        admin: Model<Iuser>,
        user: Model<Iuser>
    ) {
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
    async getAllUsers(search: string, page: number, limit: number): Promise<{ users: Iuser[]; totalCount: number }> {
        try {
            const filter = search
                ? { isAdmin: false, $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
                : { isAdmin: false };
            const users = await this.user
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            const totalCount = await this.user.countDocuments(filter);
            return { users, totalCount };
        } catch (error) {
            console.log(error);
            throw new Error("Error fetching users from database");
        }
    }
    async blockOrUnBlockUser(userId: string): Promise<Iuser | null> {
        try {
            const user = await this.user.findById(userId)
            return await this.user.findByIdAndUpdate(
                { _id: user?._id },
                { $set: { isBlocked: !user?.isBlocked } },
                { new: true }
            )
        } catch (error) {
            console.log(error)
            return null
        }
    }
}