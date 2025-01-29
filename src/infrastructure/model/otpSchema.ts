import mongoose, { Schema } from "mongoose";
import { IOtp }from "../../entities/otpEntity"

const otpSchema = new Schema<IOtp>({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
},{
    timestamps: true
})
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 })
const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);

export default OtpModel