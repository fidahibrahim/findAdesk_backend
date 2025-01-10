import { IRegisterBody } from "../interface/Controller/IUserController";
import { IOwnerRepository } from "../interface/Repository/ownerRepository";
import IOwnerUseCase from "../interface/Usecase/IOwnerUseCase";
import { otpRes } from "../interface/Usecase/IUserUseCase";
import IhashingService from "../interface/Utils/hashingService";
import IotpService from "../interface/Utils/otpService";


export default class ownerUseCase implements IOwnerUseCase {
    private ownerRepository: IOwnerRepository;
    private hashingService: IhashingService
    private otpService: IotpService
    constructor(
        ownerRepository: IOwnerRepository,
        HashingService: IhashingService,
        otpService: IotpService
    ) {
        this.ownerRepository = ownerRepository
        this.hashingService = HashingService
        this.otpService = otpService
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
    async verifyOtp(email: string, otp: string): Promise<otpRes> {
        try {
            const data = await this.ownerRepository.verifyOtp(email)
            if (data?.otp && data.email && data.otp === otp) {
                const ownerData = await this.ownerRepository.updateOwnerVerified(data.email)
                console.log("owwwwdaaata", ownerData);

                if (ownerData) {
                    console.log(ownerData, "ownerData in verifyusecase")
                    return { status: true, message: "Otp verification done", user: ownerData };
                } else {
                    return { status: false, message: "incorrect otp", }
                }
            }
            return { status: false, message: "Incorrect OTP or email not found" };
        } catch (error) {
            throw Error()
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
}