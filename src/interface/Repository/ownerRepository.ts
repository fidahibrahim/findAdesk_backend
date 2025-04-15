import { IBooking } from "../../entities/bookingEntity";
import IOwner from "../../entities/ownerEntity";
import { IWorkspace } from "../../entities/workspaceEntity";
import { IRegisterBody } from "../Controller/IUserController";
import { IotpData } from "./userRepository";

export interface IOwnerRepository {
    createOwner(data: IRegisterBody): Promise<IOwner | null>
    checkEmailExists(email: string): Promise<IOwner | null>
    checkOwnerExists(id: string): Promise<IOwner | null>
    saveOtp(email: string, otp: string): void
    verifyOtp(email: string): Promise<IotpData | null>
    updateOwnerVerified(email: string): Promise<IOwner | null>
    getWorkspaceCount(ownerId: string): Promise<number>
    getBookingCount(ownerId: string): Promise<number>
    getTotalRevenue(ownerId: string): Promise<number>
    getRecentBookings(ownerId: string): Promise<IBooking[]>
    getRecentWorkspaces(ownerId: string): Promise<IWorkspace[]>
    getMonthlyRevenue(ownerId: string): Promise<any>
    getYearlyRevenue(ownerId: string): Promise<any>
}
