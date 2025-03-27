import { ObjectId } from "mongoose";
import { checkoutBookingDetails, IBooking } from "../../entities/bookingEntity";

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

export interface bookingDetails {
    date: string;
    startTime: string;
    endTime: string;
    seats: string;
    day: string;
}

export interface IBookingUseCase {
    checkAvailability(data: AvailabilityRequest): Promise<AvailabilityResponse>
    createBooking(
        userId: string,
        workspaceId: string,
        bookingId: string,
        pricePerHour: number,
        bookingDetails: bookingDetails
    ): Promise<IBooking>;
    getBookingDetails(bookingId: string): Promise<checkoutBookingDetails[]>;
    findProductName(workspaceId: string): Promise<string | undefined>
    listBookings(ownerId: string, search: string, page: number, limit: number): Promise<{ bookings: IBooking[] | null; totalPages: number }>
    bookingViewDetails(bookingId: string): Promise<IBooking | null>
    bookingConfirmDetails(bookingId: string): Promise<any>
    updateBookingStatus(bookingId: string, status: string): Promise<any>
}