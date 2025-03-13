import mongoose, { Schema } from "mongoose";
import { IBooking } from "../../entities/bookingEntity";

const bookingSchema = new Schema<IBooking>({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    workspaceId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    bookingId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const bookingModel = mongoose.model<IBooking>('Booking', bookingSchema)
export default bookingModel
