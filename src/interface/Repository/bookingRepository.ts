import { PopulatedBooking } from "../../adapters/repository/bookingRepository";
import { checkoutBookingDetails, IBooking, ICreateBooking } from "../../entities/bookingEntity";

export interface IBookingRepository {
    createBooking(booking: ICreateBooking): Promise<IBooking>;
    getBookingDetails(bookingId: string): Promise<checkoutBookingDetails[]>;
    getBookingHistory(userId: string | undefined, status: string): Promise<any>;
    listBookings(ownerId: string, search: string, page: number, limit: number): Promise<{ bookings: IBooking[] | null, totalCount: number }>
    bookingViewDetails(bookingId: string): Promise<IBooking | null>
    bookingConfirmDetails(bookingId: string): Promise<any>
    updateBookingStatus(
        bookingId: string,
        status: string,
        seat: number,
        paymentMethod: string,
        worksapceId: string
    ): Promise<any>;
    findBookingById(bookingId: string): Promise<PopulatedBooking|null>
    updateCancelledStatus(bookingId: string, status: string): Promise<IBooking | null>
}