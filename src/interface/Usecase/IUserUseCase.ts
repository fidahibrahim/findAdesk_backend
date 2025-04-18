import Iuser from "../../entities/userEntity";
import { IWorkspace } from "../../entities/workspaceEntity";
import { IRegister, IRegisterBody } from "../Controller/IUserController";


export interface registerRes {
    status: boolean,
    message: string,
    token?: string,
    refreshToken?: string,
    user?: Iuser
}
export interface otpRes {
    status: boolean;
    message: string;
    user?: Iuser;
}
export interface logUser {
    name: string
    email: string
}
export interface loginBody {
    email: string
    password: string
}
export interface loginRes {
    status: boolean
    message: string
    token?: string
    refreshToken?: string
    user?: logUser
}
export interface GoogleProfileResponse {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}
export interface GoogleRes {
    status: boolean,
}

export interface Ifilter {
    type?: string;
    location?: string;
    date?: string;
    day?: string;
    amenities?: string;
    sortBy?: 'recommended' | 'price-low' | 'price-high';
}

export interface IuserUseCase {
    register(data: IRegisterBody): Promise<IRegister>
    verifyOtp(email: string, otp: string): Promise<otpRes>
    resendOtp(email: string): Promise<string | null>
    login(data: loginBody): Promise<loginRes | null>
    fetchGoogleUserDetails(access_token: string): Promise<loginRes | null>
    validateForgotPassword(email: string): Promise<string | null>
    changePassword(token: string, password: string): Promise<{ success: boolean; message: string; }>
    contactService(name: string, email: string, subject: string, message: string): Promise<string>
    getProfile(userId: string|undefined): Promise<Iuser|null>
    editProfile(data: Iuser): Promise<Iuser|null>
    resetPassword(userId: string|undefined, currentPassword: string, newPassword: string): Promise<Iuser>
    getRecentWorkspaces(): Promise<IWorkspace[]|null>
    searchWorkspaces(filters: Ifilter): Promise<IWorkspace[]|null>
    workspaceDetails(workspaceId: string, userId: string|undefined): Promise<IWorkspace|null>
    getBookingHistory(userId: string|undefined, filter: string): Promise<any>
    saveWorkspace(userId: string|undefined, workspaceId: string, isSaved: boolean): Promise<any>
    userDetails(userId:string):Promise<any>
}






