import { ObjectId } from "mongoose";

export interface IBooking {
    _id: string;
    bookingId: string;
    userId: ObjectId;
    workspaceId: ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    total: number;
    status?: "pending" | "completed" | "cancelled";
}