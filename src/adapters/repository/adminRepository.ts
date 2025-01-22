import { Model } from "mongoose";
import IadminRepository from "../../interface/Repository/adminRepository";
import Iuser from "../../entities/userEntity";
import IOwner from "../../entities/ownerEntity";

export default class adminRepository implements IadminRepository {
    private admin: Model<Iuser>
    private user: Model<Iuser>
    private owner: Model<IOwner>
    constructor(
        admin: Model<Iuser>,
        user: Model<Iuser>,
        owner: Model<IOwner>
    ) {
        this.admin = admin
        this.user = user
        this.owner = owner
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
    async getAllOwners(search: string, page: number, limit: number): Promise<{ owners: IOwner[]; totalCount: number; }> {
        try {
            const filter = search
                ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
                : {};
            const owners = await this.owner
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            const totalCount = await this.owner.countDocuments(filter)
            return { owners, totalCount }
        } catch (error) {
            console.log(error)
            throw new Error("Error fetching owners from database")
        }
    }
    async checkUserExists(id: string) {
        try {
            return await this.admin.findOne({ _id: id })
        } catch (error) {
            throw new Error("Failed to check the admin exists")
        }
    }
    async blockOrUnBlockOwner(ownerId: string): Promise<IOwner | null> {
        try {
            const owner = await this.owner.findById(ownerId)
            return await this.owner.findByIdAndUpdate(
                { _id: owner?._id },
                { $set: { isBlocked: !owner?.isBlocked } },
                { new: true }
            )
        } catch (error) {
            console.log(error);
            return null
        }
    }
}

