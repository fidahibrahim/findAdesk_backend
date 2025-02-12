import { GoogleProfileResponse, Ifilter, IuserUseCase, loginBody, otpRes } from "../interface/Usecase/IUserUseCase";
import { IuserRepository } from "../interface/Repository/userRepository"
import { IRegister, IRegisterBody } from "../interface/Controller/IUserController";
import IhashingService from "../interface/Utils/hashingService"
import IotpService from "../interface/Utils/otpService"
import IjwtService from "../interface/Utils/jwtService"
import axios from "axios";
import { IWorkspace } from "../entities/workspaceEntity";

export default class userUseCase implements IuserUseCase {
    private userRepository: IuserRepository;
    private hashingService: IhashingService;
    private otpService: IotpService
    private jwtService: IjwtService

    constructor(
        userRepository: IuserRepository,
        HashingService: IhashingService,
        otpService: IotpService,
        jwtService: IjwtService

    ) {
        this.userRepository = userRepository;
        this.hashingService = HashingService;
        this.otpService = otpService
        this.jwtService = jwtService
    }
    async register(data: IRegisterBody): Promise<IRegister> {
        try {
            const exist = await this.userRepository.checkEmailExists(data.email)
            if (exist) {
                throw new Error("User already exist")
            }
            if (data.password) {
                const hashedPass = await this.hashingService.hashing(data.password);
                data.password = hashedPass;
            }
            const createdUser = await this.userRepository.createUser(data)
            if (!createdUser) {
                throw new Error("Failed to create user.");
            }

            const otp = this.otpService.generateOtp();
            this.userRepository.saveOtp(data.email, otp)
            this.otpService.sendEmail(data.email, otp, data.name)
            const user = {
                name: createdUser.name,
                email: createdUser.email,
                _id: createdUser._id,
                image: createdUser.image,
            };
            return user

        } catch (error) {
            throw error
        }
    }
    async verifyOtp(email: string, otp: string): Promise<otpRes> {
        try {
            const data = await this.userRepository.verifyOtp(email)
            if (data?.otp && data.email && data.otp === otp) {
                const userData = await this.userRepository.updateUserVerified(data.email)

                if (userData) {
                    console.log(userData, "userdata in verifyusecase")
                    return { status: true, message: "Otp verification done", user: userData };
                } else {
                    return { status: false, message: "incorrect otp", }
                }
            }
            return { status: false, message: "Incorrect OTP" };
        } catch (error) {
            throw Error()
        }
    }
    async resendOtp(email: string) {
        try {
            const user = await this.userRepository.checkEmailExists(email)
            if (user) {
                const otp = this.otpService.generateOtp()
                this.userRepository.saveOtp(email, otp)
                this.otpService.sendEmail(email, otp, user.name)
                return "ResendOtp successfull"
            }
            return "Invalid Mail"
        } catch (error) {
            console.log(error);
            return null
        }
    }
    async login(data: loginBody) {
        try {
            const user = await this.userRepository.checkEmailExists(data.email)
            if (user) {
                if (user.isBlocked) {
                    throw new Error("Your account is blocked. Please contact support.")
                }
                if (!user.password) {
                    throw new Error("Try Google Authentication")
                }
                const status = await this.hashingService.compare(
                    data.password,
                    user.password
                )
                if (!status) {
                    throw new Error("Incorrect Password")
                }
                if (user.isVerified == false) {
                    const otp = this.otpService.generateOtp()
                    this.userRepository.saveOtp(user.email, otp)
                    this.otpService.sendEmail(user.email, otp, user.name)
                    return { status: false, message: "Otp is not verified" }
                }
                const payload = {
                    userId: user._id,
                    name: user.name,
                    role: "user",
                }
                const token = this.jwtService.generateToken(payload)
                const refreshToken = this.jwtService.generateRefreshToken(payload)
                const filteredData = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
                return { status: true, message: "Logined Successfully", user: filteredData, token, refreshToken }
            }
            return { status: false, message: "Email Not found" };

        } catch (error) {
            throw error
        }
    }
    async fetchGoogleUserDetails(access_token: string) {
        try {
            const response = await axios.get<GoogleProfileResponse>(
                `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        Accept: 'application/json',
                    },
                }
            )
            const googleUser = await this.userRepository.googleUser(response.data)
            const payload = {
                userId: googleUser._id,
                name: googleUser.name,
                role: "user"
            }
            const token = this.jwtService.generateToken(payload)
            const refreshToken = this.jwtService.generateRefreshToken(payload)
            const filteredData = {
                _id: googleUser._id,
                name: googleUser.name,
                email: googleUser.email,
            }
            return { status: true, message: "Successfull", token, refreshToken, user: filteredData }
        } catch (error) {
            throw error
        }
    }
    async validateForgotPassword(email: string): Promise<string | null> {
        try {
            const user = await this.userRepository.checkEmailExists(email)
            if (!user) {
                return "User not exist with this email"
            }
            let data = {
                userId: user?._id as string,
                name: user?.name as string,
                role: 'user',
            }
            const exp = "3m";
            const token = await this.jwtService.generateTokenForgot(data, exp)
            const resetLink = `http://localhost:5000/resetPassword/${token}`
            await this.otpService.sendEmailForgotPassword(resetLink, user.email)
            return "Email sended to the user";
        } catch (error) {
            throw error
        }
    }
    async contactService(name: string, email: string, subject: string, message: string) {
        try {
            await this.otpService.contactEmailService(name, email, subject, message)
            return "Email sent successfully!"
        } catch (error) {
            throw error
        }
    }
    async getProfile(userId: string) {
        try {
            const response = await this.userRepository.getProfile(userId)
            return response
        } catch (error) {
            throw error
        }
    }
    async getRecentWorkspaces() {
        try {
            return await this.userRepository.getRecentWorkspaces()
        } catch (error) {
            throw error
        }
    }
    async searchWorkspaces(filters: Ifilter) {
        try {
            return await this.userRepository.findWorkspaces(filters)
        } catch (error) {
            throw error
        }
    }
    async workspaceDetails(workspaceId: string) {
        try {
            const response = await this.userRepository.workspaceDetails(workspaceId)
            console.log(response, "response in usecase")
            return response
        } catch (error) {
            throw error
        }
    }
}