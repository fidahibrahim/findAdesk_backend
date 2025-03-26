import mongoose, { Schema } from "mongoose";
import { IBooking } from "../../entities/bookingEntity";

const bookingSchema = new Schema<IBooking>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspaceId: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
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
    duration: {
        type: String,
    },
    seats: {
        type: String,
        required: true
    },
    concern: {
        type: String
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
