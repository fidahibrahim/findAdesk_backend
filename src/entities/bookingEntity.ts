import { ObjectId } from "mongoose";
import { bookingDetails } from "../interface/Usecase/IBookingUseCase";

export interface IBooking {
    _id?: string;
    bookingId?: string;
    userId: ObjectId;
    workspaceId: ObjectId;
    workspaceOwnerId: ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    hours?: number;
    additionalSeats?: number;
    additionalSeatsAmount?: number;
    serviceFee?: number;
    day?: string;
    seats: string;
    pricePerHour: number;
    subTotal: number;
    total: number;
    grandTotal: number;
    status?: "pending" | "completed" | "cancelled"
}

export interface ICreateBooking {
    userId: string;
    workspaceId: string;
    bookingId: string;
    pricePerHour: number;
    bookingDetails: bookingDetails;
}

export interface checkoutBookingDetails {
    bookingId: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    hours: number;
    additionalSeats: number;
    additionalSeatsAmount: number;
    serviceFee: number;
    day: string;
    seats: number;
    pricePerHour: number;
    total: number;
    subTotal: number;
    grandTotal: number;
    user: {
      name: string;
      email: string;
      mobile: string;
    };
    workspace: {
      workspaceId: string;
      workspaceName: string;
      spaceDescription: string;
      amenities: string[];
      images: string;
    };
  }