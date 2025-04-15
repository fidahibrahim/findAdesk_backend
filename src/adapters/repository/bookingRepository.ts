import mongoose, { Model, Types } from "mongoose";
import { checkoutBookingDetails, IBooking, ICreateBooking } from "../../entities/bookingEntity";
import { IBookingRepository } from "../../interface/Repository/bookingRepository";
import { IWorkspace } from "../../entities/workspaceEntity";
import { ISavedWorkspace } from "../../entities/savedWorkspaceEntity";
import { IReview } from "../../entities/reviewEntity";

interface Workspace {
  _id: Types.ObjectId;
  workspaceName: string;
  capacity: number;
}

interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

export interface PopulatedBooking {
  workspaceId: Workspace;
  userId: User;
  seats: number;
  status: string;
  subTotal: number;
}

export default class bookingRepository implements IBookingRepository {
  private booking: Model<IBooking>;
  private workspace: Model<IWorkspace>;
  private savedWorkspace: Model<ISavedWorkspace>;
  private review: Model<IReview>

  constructor(booking: Model<IBooking>, workspace: Model<IWorkspace>, savedWorkspace: Model<ISavedWorkspace>, review: Model<IReview>) {
    this.booking = booking;
    this.workspace = workspace;
    this.savedWorkspace = savedWorkspace;
    this.review = review;
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

      const hours = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      );

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
      return createdBooking;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw new Error("Failed to create booking");
    }
  }

  async getBookingDetails(bookingId: string) {
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
        })
      return response
    } catch (error) {
      throw error
    }
  }
  async getBookingHistory(userId: string | undefined, filter: string) {
    try {
      if (filter === 'saved') {
        const savedWorkspaces = await this.savedWorkspace.find({ userId: userId, isActive: true })
          .sort({ createdAt: -1 })
          .populate({
            path: 'workspaceId',
            select: 'workspaceName workspaceMail spaceDescription place street state images'
          });
        return savedWorkspaces.map(item => ({
          _id: item._id,
          userId: item.userId,
          workspaceId: item.workspaceId,
          status: 'saved',
        }));
      }
      let query: any = { userId: userId }
      if (filter !== 'all') {
        query.status = filter
      }
      const bookings = await this.booking.find(query)
        .sort({ _id: -1 })
        .populate({
          path: 'workspaceId',
          select: 'workspaceName workspaceMail place street state images'
        })
      return bookings
    } catch (error) {
      throw error
    }
  }

  async bookingConfirmDetails(bookingId: string) {
    try {
      const response = await this.booking.find({ bookingId: bookingId })
        .populate({
          path: 'userId',
          select: 'name email mobile'
        })
        .populate({
          path: 'workspaceId',
          select: 'workspaceName workspaceMail place street state'
        })
      return response
    } catch (error) {
      throw error
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: string,
    seats: number,
    paymentMethod: string,
    worksapceId: string
  ) {
    try {
      const workspace = await this.workspace.findById(worksapceId);
      if (!workspace) {
        throw new Error("Workspace not found");
      }

      if (workspace.capacity ! < seats) {
        throw new Error("Not enough capacity in the workspace");
      }

      workspace.bookedSeats! += seats;
      
      await workspace.save();

      const updatedBooking = await this.booking.findOneAndUpdate(
        { bookingId: bookingId },
        {
          status: status,
          paymentMethod: paymentMethod,
          updatedAt: new Date(),
        },
        {
          new: true,
        }
      );

      return updatedBooking;
    } catch (error) {
      throw error;
    }
  }
  async findBookingById(bookingId: string): Promise<PopulatedBooking|null> {
    try {
      const booking = await this.booking.findById(bookingId)
      .populate("workspaceId")
      .populate("userId")
      .lean<PopulatedBooking>()
      .exec();
      return booking
    } catch (error) {
      throw error
    }
  }
  async updateCancelledStatus(bookingId: string, status: string) {
    try {
      return await this.booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
      )
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}