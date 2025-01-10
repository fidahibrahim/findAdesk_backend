import mongoose, { Schema } from "mongoose";
import IOwner from "../../entities/ownerEntity";

const ownerSchema = new Schema<IOwner>({
    name:{
        type: String,
        required: true
    },
    email:{
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
})

const ownerModel = mongoose.model<IOwner>('Owner', ownerSchema)
export default ownerModel