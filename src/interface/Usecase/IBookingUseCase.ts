import { ObjectId } from "mongoose";
import { IBooking } from "../../entities/bookingEntity";

export interface AvailabilityRequest {
    workspaceId: string;
    date: string; 
    startTime: string; 
    endTime: string; 
    seats: number;
    day: string; 
}
interface AvailabilityResponse {
    isAvailable: boolean;
    message: string;
}
export interface CreateBookingData {
    userId: ObjectId;
    workspaceId: ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    mobile: string;
    seats: string;
    concern: string;
    total: number;
    status: "pending" | "completed" | "cancelled";
}

export interface IBookingUseCase {
    checkAvailability(data: AvailabilityRequest): Promise<AvailabilityResponse>
    createBooking(data: CreateBookingData): Promise<IBooking>
    findProductName (workspaceId: string): Promise<string|undefined>
}