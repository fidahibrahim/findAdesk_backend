import { IBooking } from "../../entities/bookingEntity";
import IOwner from "../../entities/ownerEntity";
import Iuser from "../../entities/userEntity"
import { IWorkspace } from "../../entities/workspaceEntity";


export default interface IadminRepository {
    checkEmailExists(email: string): Promise<Iuser | null>
    checkUserExists(id: string): Promise<Iuser | null>
    getAllUsers(search: string, page: number, limit: number): Promise<{ users: Iuser[]; totalCount: number }>
    blockOrUnBlockUser(id: string): Promise<Iuser | null>
    getAllOwners(search: string, page: number, limit: number): Promise<{ owners: IOwner[]; totalCount: number }>
    blockOrUnBlockOwner(id: string): Promise<IOwner | null>
    findWorkspace(workspaceId: string): Promise<IWorkspace | null>
    getWorkspaces(search: string, page: number, limit: number, status?: string): Promise<{ workspaces: IWorkspace[] | null; totalCount: number }>
    updateStatus(workspaceId: string, status: string): Promise<IWorkspace | null>
    workspaceDetails(workspaceId: string): Promise<IWorkspace | null>
    getServiceFeeSum(startDate?: Date, endDate?: Date): Promise<any>
    getAllBookings(page: number, limit: number ): Promise<IBooking[]>
    getAllBookingsCount(): Promise<any>
    getBookingsWithinDateRange(startDate: Date, endDate: Date, page: number , limit: number ): Promise<IBooking[]>
    getBookingsCountWithinDateRange(startDate: Date, endDate: Date): Promise<any>
}