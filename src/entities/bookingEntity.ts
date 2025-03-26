import { ObjectId } from "mongoose";

export interface IBooking {
    _id?: string;
    bookingId?: string;
    userId: ObjectId;
    workspaceId: ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    duration?: string;
    seats: string;
    concern: string;
    total: number;
    status?: "pending" | "completed" | "cancelled";
}