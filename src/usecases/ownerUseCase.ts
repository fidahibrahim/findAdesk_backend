import { IRegisterBody } from "../interface/Controller/IUserController";
import { IOwnerRepository } from "../interface/Repository/ownerRepository";
import IOwnerUseCase from "../interface/Usecase/IOwnerUseCase";
import { loginBody, otpRes } from "../interface/Usecase/IUserUseCase";
import IhashingService from "../interface/Utils/hashingService";
import IjwtService from "../interface/Utils/jwtService";
import IotpService from "../interface/Utils/otpService";

export default class ownerUseCase implements IOwnerUseCase {
    private ownerRepository: IOwnerRepository;
    private hashingService: IhashingService
    private otpService: IotpService
    private jwtService: IjwtService
    constructor(
        ownerRepository: IOwnerRepository,
        HashingService: IhashingService,
        otpService: IotpService,
        jwtService: IjwtService
    ) {
        this.ownerRepository = ownerRepository
        this.hashingService = HashingService
        this.otpService = otpService
        this.jwtService = jwtService
    }
    async register(data: IRegisterBody): Promise<IRegisterBody> {
        try {
            const exist = await this.ownerRepository.checkEmailExists(data.email)
            if (exist) {
                return {
                    ...data,
                    status: false,
                    message: "This user already exist"
                }
            }
            if (data.password) {
                const hashedPass = await this.hashingService.hashing(data.password)
                data.password = hashedPass
            }
            const createdOwner = await this.ownerRepository.createOwner(data)
            if (!createdOwner) {
                throw new Error("Failed to create owner.")
            }

            const otp = this.otpService.generateOtp()
            this.ownerRepository.saveOtp(data.email, otp,)
            this.otpService.sendEmail(data.email, otp, data.name)

            return createdOwner

        } catch (error) {
            throw new Error()
        }
    }
    async ownerVerifyOtp(email: string, otp: string): Promise<otpRes> {
        try {
            const data = await this.ownerRepository.verifyOtp(email)
            if (data?.otp && data.email && data.otp === otp) {
                const ownerData = await this.ownerRepository.updateOwnerVerified(data.email)

                if (ownerData) {
                    console.log(ownerData, "ownerData in verifyusecase")
                    return { status: true, message: "Otp verification done", user: ownerData };
                } else {
                    return { status: false, message: "incorrect otp", }
                }
            }
            return { status: false, message: "Incorrect OTP or email not found" };
        } catch (error) {
            throw Error("verify otp failed")
        }
    }
    async resendOtp(email: string): Promise<string | null> {
        try {
            const owner = await this.ownerRepository.checkEmailExists(email)
            if (owner) {
                const otp = this.otpService.generateOtp()
                this.ownerRepository.saveOtp(email, otp)
                this.otpService.sendEmail(email, otp, owner.name)
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
            const ownerData = await this.ownerRepository.checkEmailExists(data.email)
            if (ownerData) {
                if (!ownerData.password) {
                    return {
                        status: false,
                        message: "Try Google Authentication",
                        user: ownerData
                    }
                }
                const status = await this.hashingService.compare(
                    data.password,
                    ownerData.password
                )
                if (!status) {
                    return {
                        status: false,
                        message: "Incorrect Password"
                    }
                }
                if (ownerData.isVerified == false) {
                    const otp = this.otpService.generateOtp()
                    this.ownerRepository.saveOtp(ownerData.email, otp)
                    this.otpService.sendEmail(ownerData.email, otp, ownerData.name)
                    return { status: false, message: "Otp is not verified" }
                }
                const payload = {
                    userId: ownerData._id,
                    name: ownerData.name,
                    role: "owner"
                }
                const token = this.jwtService.generateToken(payload)
                const refreshToken = this.jwtService.generateRefreshToken(payload)
                const filteredData = {
                    _id: ownerData._id,
                    name: ownerData.name,
                    email: ownerData.email
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