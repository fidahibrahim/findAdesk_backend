import Iuser from "../../entities/userEntity";
import { IRegisterBody } from "../Controller/IUserController";


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
    picture: string;
  }

  export interface GoogleRes {
    status: boolean,
  }

export interface IuserUseCase {
    register(data: IRegisterBody): Promise<IRegisterBody>
    verifyOtp(email: string, otp: string): Promise<otpRes>
    resendOtp(email: string): Promise<string | null>
    login(data: loginBody): Promise<loginRes | null>
    fetchGoogleUserDetails(access_token: string): Promise<loginRes | null>
}






