import { checkoutBookingDetails, IBooking, ICreateBooking } from "../../entities/bookingEntity";

export interface IBookingRepository {
    createBooking(booking: ICreateBooking): Promise<IBooking>;
    getBookingDetails(bookingId: string): Promise<checkoutBookingDetails[]>;
    getBookingHistory(userId: string|undefined): Promise<any>;
    listBookings(ownerId: string, search: string, page: number, limit: number): Promise<{ bookings: IBooking[] | null, totalCount: number }>
    bookingViewDetails(bookingId: string): Promise<IBooking | null>
    getServiceFeeSum(startDate?: Date, endDate?: Date): Promise<any>
    bookingConfirmDetails(bookingId: string): Promise<any>
    updateBookingStatus(bookingId: string, status: string): Promise<any>
}