import IOwner from "../../entities/ownerEntity";
import { IRegisterBody } from "../Controller/IUserController";
import { IotpData } from "./userRepository";

export interface IOwnerRepository {
    createOwner(data: IRegisterBody): Promise<IOwner | null>
    checkEmailExists(email: string): Promise<IOwner | null>
    checkOwnerExists(id: string): Promise<IOwner | null>
    saveOtp(email: string, otp: string): void
    verifyOtp(email: string): Promise<IotpData | null>
    updateOwnerVerified(email: string): Promise<IOwner|null>
}
