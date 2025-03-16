import { IBooking } from "../../entities/bookingEntity";

export interface IBookingRepository {
    createBooking(booking: IBooking): Promise<IBooking>
}