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
    async createBooking(booking: IBooking) {
        try {
            const createdBooking = await this.booking.create(booking);
            console.log(createdBooking,"booking created in repository")
            return createdBooking;
        } catch (error) {
            throw new Error("Failed to create booking")
        }
    }
}