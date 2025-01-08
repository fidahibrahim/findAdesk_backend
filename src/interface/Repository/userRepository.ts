import { IRegisterBody } from "../Controller/IUserController";
import IUser from '../../entities/userEntity'

export interface IotpData {
    _id: string
    otp: string
    email: string
    createdAt: Date
}


export interface IuserRepository{
    checkEmailExists(email: string): Promise<IUser|null>
    createUser(data: IRegisterBody): Promise<IUser|null>
    saveOtp(email: string, otp: string): void
    verifyOtp(email: string): Promise<IotpData|null>
    updateUserVerified(email: string): Promise<IUser|null>
}