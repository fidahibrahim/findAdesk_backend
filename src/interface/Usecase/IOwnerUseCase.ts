import { IRegisterBody } from "../Controller/IUserController"
import { loginBody, loginRes, otpRes } from "./IUserUseCase"

export default interface IOwnerUseCase {
    register(data: IRegisterBody): Promise<IRegisterBody>
    ownerVerifyOtp(email: string, otp: string): Promise<otpRes>
    resendOtp(email: string): Promise<string | null>
    login(data: loginBody): Promise<loginRes | null>
    getDashboardData(ownerId: string): Promise<any>
}
