import { IuserUseCase, loginBody, otpRes } from "../interface/Usecase/IUserUseCase";
import { IuserRepository } from "../interface/Repository/userRepository"
import { IRegisterBody } from "../interface/Controller/IUserController";
import Iuser from "../entities/userEntity";
import IhashingService from "../interface/Utils/hashingService"
import IotpService from "../interface/Utils/otpService"
import IjwtService from "../interface/Utils/jwtService"

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
    async register(data: IRegisterBody): Promise<IRegisterBody> {
        try {
            const exist = await this.userRepository.checkEmailExists(data.email)
            if (exist) {
                return {
                    ...data,
                    status: false,
                    message: "This user already exist"
                }
            }
            if (data.password) {
                const hashedPass = await this.hashingService.hashing(data.password);
                data.password = hashedPass;
            }
            const createdUser: Iuser | null = await this.userRepository.createUser(data)
            if (!createdUser) {
                throw new Error("Failed to create user.");
            }

            const otp = await this.otpService.generateOtp();
            this.userRepository.saveOtp(data.email, otp)
            this.otpService.sendEmail(data.email, otp, data.name)
            return createdUser as IRegisterBody

        } catch (error) {
            throw new Error()
        }
    }

    async verifyOtp(email: string, otp: string): Promise<otpRes> {
        try {
            const data = await this.userRepository.verifyOtp(email)
            console.log("dataaaaaaaaa", data)
            if (data?.otp && data.email && data.otp === otp) {
                const userData = await this.userRepository.updateUserVerified(data.email)
                console.log("userdaaata", userData);

                if (userData) {
                    console.log(userData, "userdata in verifyusecase")
                    return { status: true, message: "Otp verification done", user: userData };
                } else {
                    return { status: false, message: "incorrect otp", }
                }
            }
            return { status: false, message: "Incorrect OTP or email not found" };
        } catch (error) {
            throw Error()
        }
    }

    async resendOtp(email: string) {
        try {
            const user = await this.userRepository.checkEmailExists(email)
            console.log("user in usecase", user)
            if (user) {
                const otp = this.otpService.generateOtp()
                console.log('otp in usecase', otp);

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
                if (!user.password) {
                    return {
                        status: false,
                        message: "Try Google Authentication",
                        user: user
                    }
                }
                const status = await this.hashingService.compare(
                    data.password,
                    user.password
                )
                if (!status) {
                    return {
                        status: false,
                        message: "Incorrect Password"
                    }
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
                }
                const token = this.jwtService.generateToken(payload)
                const refreshToken = this.jwtService.generateRefreshToken(payload)
                const filteredData  = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }
                return { status: true, message: "Logined Successfully", user: filteredData, token, refreshToken }
            }
            return { status: false, message: "Email Not found" };

        } catch (error) {
            return {
                status: false,
                message: "",
            };
        }
    }
}