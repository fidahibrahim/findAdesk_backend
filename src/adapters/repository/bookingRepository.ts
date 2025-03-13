import { Model } from "mongoose";
import { IBooking } from "../../entities/bookingEntity";
import { IBookingRepository } from "../../interface/Repository/bookingRepository";

export default class bookingRepository implements IBookingRepository {
    private booking: Model<IBooking>
    constructor(
        booking: Model<IBooking>
    ) {
        this.booking = booking
    }
}