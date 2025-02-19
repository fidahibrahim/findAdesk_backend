import { IRegisterBody } from "../Controller/IUserController";
import IUser from '../../entities/userEntity'
import { GoogleProfileResponse, Ifilter } from "../Usecase/IUserUseCase";
import { IWorkspace } from "../../entities/workspaceEntity";

export interface IotpData {
    _id: string
    otp: string
    email: string
    createdAt: Date
}

export interface IuserRepository {
    checkEmailExists(email: string): Promise<IUser | null>
    createUser(data: IRegisterBody): Promise<IUser | null>
    findById(userId: string): Promise<IUser|null>
    saveOtp(email: string, otp: string): void
    verifyOtp(email: string): Promise<IotpData | null>
    updateUserVerified(email: string): Promise<IUser | null>
    googleUser(data: GoogleProfileResponse): Promise<any>
    getProfile(userId: string | undefined): Promise<IUser | null>
    changePassword(userId: string, password: string): Promise<IUser|null>
    getRecentWorkspaces(): Promise<IWorkspace[] | null>
    findWorkspaces(filters: Ifilter): Promise<IWorkspace[] | null>
    workspaceDetails(workspaceId: string): Promise<IWorkspace | null>
}