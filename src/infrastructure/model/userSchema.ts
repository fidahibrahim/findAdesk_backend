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
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    }
})

const userModel = mongoose.model<Iuser>('User', userSchema)
export default userModel