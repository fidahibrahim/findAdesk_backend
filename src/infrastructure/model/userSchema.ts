import mongoose, { Schema } from "mongoose";
import Iuser from "../../entities/userEntity";

const userSchema = new Schema<Iuser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    image: {
        type: String,
        default: " https://github.com/shadcn.png "
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    }
},
{timestamps: true})

const userModel = mongoose.model<Iuser>('User', userSchema)
export default userModel