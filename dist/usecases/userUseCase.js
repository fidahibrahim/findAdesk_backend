"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class userUseCase {
    constructor(userRepository, HashingService, otpService, jwtService) {
        this.userRepository = userRepository;
        this.hashingService = HashingService;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }
    async register(data) {
        try {
            const exist = await this.userRepository.checkEmailExists(data.email);
            if (exist) {
                return {
                    ...data,
                    status: false,
                    message: "This user already exist"
                };
            }
            if (data.password) {
                const hashedPass = await this.hashingService.hashing(data.password);
                data.password = hashedPass;
            }
            const createdUser = await this.userRepository.createUser(data);
            if (!createdUser) {
                throw new Error("Failed to create user.");
            }
            const otp = await this.otpService.generateOtp();
            this.userRepository.saveOtp(data.email, otp);
            this.otpService.sendEmail(data.email, otp, data.name);
            return createdUser;
        }
        catch (error) {
            throw new Error();
        }
    }
    async verifyOtp(email, otp) {
        try {
            const data = await this.userRepository.verifyOtp(email);
            console.log("dataaaaaaaaa", data);
            if ((data === null || data === void 0 ? void 0 : data.otp) && data.email && data.otp === otp) {
                const userData = await this.userRepository.updateUserVerified(data.email);
                console.log("userdaaata", userData);
                if (userData) {
                    console.log(userData, "userdata in verifyusecase");
                    return { status: true, message: "Otp verification done", user: userData };
                }
                else {
                    return { status: false, message: "incorrect otp", };
                }
            }
            return { status: false, message: "Incorrect OTP or email not found" };
        }
        catch (error) {
            throw Error();
        }
    }
    async resendOtp(email) {
        try {
            const user = await this.userRepository.checkEmailExists(email);
            console.log("user in usecase", user);
            if (user) {
                const otp = this.otpService.generateOtp();
                console.log('otp in usecase', otp);
                this.userRepository.saveOtp(email, otp);
                this.otpService.sendEmail(email, otp, user.name);
                return "ResendOtp successfull";
            }
            return "Invalid Mail";
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async login(data) {
        try {
            const user = await this.userRepository.checkEmailExists(data.email);
            if (user) {
                if (!user.password) {
                    return {
                        status: false,
                        message: "Try Google Authentication",
                        user: user
                    };
                }
                const status = await this.hashingService.compare(data.password, user.password);
                if (!status) {
                    return {
                        status: false,
                        message: "Incorrect Password"
                    };
                }
                if (user.isVerified == false) {
                    const otp = this.otpService.generateOtp();
                    this.userRepository.saveOtp(user.email, otp);
                    this.otpService.sendEmail(user.email, otp, user.name);
                    return { status: false, message: "Otp is not verified" };
                }
                const payload = {
                    userId: user._id,
                    name: user.name,
                };
                const token = this.jwtService.generateToken(payload);
                const refreshToken = this.jwtService.generateRefreshToken(payload);
                const filteredData = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                };
                return { status: true, message: "Logined Successfully", user: filteredData, token, refreshToken };
            }
            return { status: false, message: "Email Not found" };
        }
        catch (error) {
            return {
                status: false,
                message: "",
            };
        }
    }
}
exports.default = userUseCase;
//# sourceMappingURL=userUseCase.js.map