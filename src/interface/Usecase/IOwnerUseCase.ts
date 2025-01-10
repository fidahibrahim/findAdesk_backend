import { IRegisterBody } from "../Controller/IUserController"
import { otpRes } from "./IUserUseCase"

export default interface IOwnerUseCase {
    register(data: IRegisterBody): Promise<IRegisterBody>
    verifyOtp(email: string, otp: string): Promise<otpRes>
    resendOtp(email: string): Promise<string | null>
}