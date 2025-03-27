import mongoose, { Model } from "mongoose";
import { checkoutBookingDetails, IBooking, ICreateBooking } from "../../entities/bookingEntity";
import { IBookingRepository } from "../../interface/Repository/bookingRepository";
import { IWorkspace } from "../../entities/workspaceEntity";

export default class bookingRepository implements IBookingRepository {
  private booking: Model<IBooking>;
  private workspace: Model<IWorkspace>;
  constructor(booking: Model<IBooking>, workspace: Model<IWorkspace>) {
    this.booking = booking;
    this.workspace = workspace;
  }

  async createBooking(booking: ICreateBooking) {
    try {
      const workspace = await this.workspace.findById(booking.workspaceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      const bookingDate = new Date(booking.bookingDetails.date);
      const startTime = new Date(
        `${booking.bookingDetails.date}T${booking.bookingDetails.startTime}:00Z`
      );
      const endTime = new Date(
        `${booking.bookingDetails.date}T${booking.bookingDetails.endTime}:00Z`
      );

      // Calculate total hours and round it
      const hours = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      );

      // Calculate additional seats
      const additionalSeats = Math.max(
        parseInt(booking.bookingDetails.seats) - 1,
        0
      );

      const total = Math.round(hours * booking.pricePerHour);
      const additionalSeatsTotal = Math.round(additionalSeats * total);
      const subTotal = Math.round(total + additionalSeatsTotal);
      const serviceFee = Math.round(subTotal * 0.1);
      const grandTotal = Math.round(subTotal + serviceFee);

      const bookingDetails = {
        userId: new mongoose.Types.ObjectId(booking.userId),
        workspaceId: new mongoose.Types.ObjectId(booking.workspaceId),
        workspaceOwnerId: new mongoose.Types.ObjectId(workspace.ownerId),
        bookingId: booking.bookingId,
        date: bookingDate,
        startTime,
        endTime,
        hours,
        additionalSeats,
        additionalSeatsAmount: additionalSeatsTotal,
        serviceFee,
        day: booking.bookingDetails.day,
        seats: parseInt(booking.bookingDetails.seats),
        pricePerHour: booking.pricePerHour,
        total,
        subTotal,
        grandTotal,
        status: "pending",
      };

      const createdBooking = await this.booking.create(bookingDetails);
      console.log("Booking created in repository");
      return createdBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error("Failed to create booking");
    }
  }

  async getBookingDetails(bookingId: string) {
    console.log("bookingId shds", bookingId);

    try {
      const response = await this.booking.aggregate<checkoutBookingDetails>([
        {
          $match: {
            bookingId: bookingId,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "workspaces",
            localField: "workspaceId",
            foreignField: "_id",
            as: "workspaceDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$workspaceDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            bookingId: 1,
            date: 1,
            startTime: 1,
            endTime: 1,
            hours: 1,
            additionalSeats: 1,
            additionalSeatsAmount: 1,
            serviceFee: 1,
            day: 1,
            seats: 1,
            pricePerHour: 1,
            total: 1,
            subTotal: 1,
            grandTotal: 1,
            user: {
              name: "$userDetails.name",
              email: "$userDetails.email",
              mobile: "$userDetails.mobile",
            },
            workspace: {
              workspaceId: "$workspaceDetails._id",
              workspaceName: "$workspaceDetails.workspaceName",
              spaceDescription: "$workspaceDetails.spaceDescription",
              amenities: "$workspaceDetails.amenities",
              images: { $arrayElemAt: ["$workspaceDetails.images", 0] },
            },
          },
        },
      ]);
      console.log("response jshd", response);

      if (!response) throw new Error("Booking not found");
      return response;
    } catch (error) {
      throw error;
    }
  }

  async listBookings(ownerId: string, search: string, page: number, limit: number) {
    try {
      const filter = {
        workspaceOwnerId: new mongoose.Types.ObjectId(ownerId),
        ...(search && {
          $or: [
            { bookingId: { $regex: search, $options: "i" } },
          ],
        }),
      };
      const bookings = await this.booking
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ _id: -1 });
      const totalCount = await this.booking.countDocuments(filter)
      return { bookings, totalCount }
    } catch (error) {
      throw error
    }
  }

  async bookingViewDetails(bookingId: string) {
    try {
      const response = await this.booking.findById(bookingId)
        .populate({
          path: 'userId',
          select: 'name email mobile'
        })
        .populate({
          path: 'workspaceId',
          select: 'workspaceName workspaceMail place street state'
        })
      console.log(response, 'response in repository')
      return response
    } catch (error) {
      throw error
    }
  }

  async getServiceFeeSum(startDate: Date, endDate: Date) {
    try {
      const matchStage: { date?: { $gte: Date; $lte: Date } } = {};
      if (startDate && endDate) {
        matchStage.date = { $gte: startDate, $lte: endDate };
      }
      if (startDate && endDate) {
        matchStage.date = { $gte: startDate, $lte: endDate };
      }
      console.log(matchStage, 'match stage in repository')
      const result = await this.booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalServiceFee: { $sum: "$serviceFee" }
          }
        }
      ]);
      console.log(result, 'result in repository')
      return result.length > 0 ? result[0].totalServiceFee : 0;

    } catch (error) {
      throw error
    }
  }
}