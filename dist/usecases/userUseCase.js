"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const sharp_1 = __importDefault(require("sharp"));
const s3Bucket_1 = require("../infrastructure/utils/s3Bucket");
const responseMssg_1 = require("../constants/responseMssg");
class userUseCase {
    constructor(userRepository, bookingRepository, workspaceRepository, HashingService, otpService, jwtService) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.workspaceRepository = workspaceRepository;
        this.hashingService = HashingService;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }
    async register(data) {
        try {
            const exist = await this.userRepository.checkEmailExists(data.email);
            if (exist) {
                throw new Error("User already exist");
            }
            if (data.password) {
                const hashedPass = await this.hashingService.hashing(data.password);
                data.password = hashedPass;
            }
            const createdUser = await this.userRepository.createUser(data);
            if (!createdUser) {
                throw new Error("Failed to create user.");
            }
            const otp = this.otpService.generateOtp();
            this.userRepository.saveOtp(data.email, otp);
            this.otpService.sendEmail(data.email, otp, data.name);
            const user = {
                name: createdUser.name,
                email: createdUser.email,
                _id: createdUser._id,
                image: createdUser.image,
            };
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async verifyOtp(email, otp) {
        try {
            const data = await this.userRepository.verifyOtp(email);
            if ((data === null || data === void 0 ? void 0 : data.otp) && data.email && data.otp === otp) {
                const userData = await this.userRepository.updateUserVerified(data.email);
                if (userData) {
                    console.log(userData, "userdata in verifyusecase");
                    return { status: true, message: "Otp verification done", user: userData };
                }
                else {
                    return { status: false, message: "incorrect otp", };
                }
            }
            return { status: false, message: "Incorrect OTP" };
        }
        catch (error) {
            throw Error();
        }
    }
    async resendOtp(email) {
        try {
            const user = await this.userRepository.checkEmailExists(email);
            if (user) {
                const otp = this.otpService.generateOtp();
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
                if (user.isBlocked) {
                    throw new Error("Your account is blocked. Please contact support.");
                }
                if (!user.password) {
                    throw new Error("Try Google Authentication");
                }
                const status = await this.hashingService.compare(data.password, user.password);
                if (!status) {
                    throw new Error("Incorrect Password");
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
                    role: "user",
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
            throw error;
        }
    }
    async fetchGoogleUserDetails(access_token) {
        try {
            const response = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    Accept: 'application/json',
                },
            });
            const googleUser = await this.userRepository.googleUser(response.data);
            const payload = {
                userId: googleUser._id,
                name: googleUser.name,
                role: "user"
            };
            const token = this.jwtService.generateToken(payload);
            const refreshToken = this.jwtService.generateRefreshToken(payload);
            const filteredData = {
                _id: googleUser._id,
                name: googleUser.name,
                email: googleUser.email,
            };
            return { status: true, message: "Successfull", token, refreshToken, user: filteredData };
        }
        catch (error) {
            throw error;
        }
    }
    async validateForgotPassword(email) {
        try {
            const user = await this.userRepository.checkEmailExists(email);
            if (!user) {
                return "User not exist with this email";
            }
            let data = {
                userId: user === null || user === void 0 ? void 0 : user._id,
                name: user === null || user === void 0 ? void 0 : user.name,
                role: 'user',
            };
            const exp = "3m";
            const token = await this.jwtService.generateTokenForgot(data, exp);
            const resetLink = `http://localhost:5000/resetPassword/${token}`;
            await this.otpService.sendEmailForgotPassword(resetLink, user.email);
            return "Email sended to the user";
        }
        catch (error) {
            throw error;
        }
    }
    async changePassword(token, password) {
        try {
            const decoded = this.jwtService.verifyToken(token);
            const user = await this.userRepository.findById(decoded.userId);
            if (!user) {
                throw new Error("User not found");
            }
            const hashedPass = await this.hashingService.hashing(password);
            await this.userRepository.changePassword(decoded.userId, hashedPass);
            return { success: true, message: "Password changed successfully" };
        }
        catch (error) {
            throw error;
        }
    }
    async contactService(name, email, subject, message) {
        try {
            await this.otpService.contactEmailService(name, email, subject, message);
            return "Email sent successfully!";
        }
        catch (error) {
            throw error;
        }
    }
    async getProfile(userId) {
        try {
            const response = await this.userRepository.getProfile(userId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async editProfile(data) {
        try {
            if ((data === null || data === void 0 ? void 0 : data.image) && typeof data.image !== "string") {
                const { originalname, mimetype, buffer } = data.image;
                const optimizedImage = await (0, sharp_1.default)(buffer).resize(500).toBuffer();
                await (0, s3Bucket_1.sendObjectToS3)(originalname, mimetype, buffer, optimizedImage);
                const imageUrl = await (0, s3Bucket_1.createImageUrl)(originalname);
                data.image = imageUrl;
            }
            const response = await this.userRepository.updateProfile(data);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async resetPassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error(responseMssg_1.ResponseMessage.USER_NOT_FOUND);
            }
            const isPasswordValid = await this.hashingService.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new Error(responseMssg_1.ResponseMessage.INVALID_PASSWORD);
            }
            const hashedPass = await this.hashingService.hashing(newPassword);
            const response = await this.userRepository.resetPassword(userId, hashedPass);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getRecentWorkspaces() {
        try {
            return await this.userRepository.getRecentWorkspaces();
        }
        catch (error) {
            throw error;
        }
    }
    async searchWorkspaces(filters) {
        try {
            return await this.userRepository.findWorkspaces(filters);
        }
        catch (error) {
            throw error;
        }
    }
    async workspaceDetails(workspaceId, userId) {
        try {
            const response = await this.userRepository.workspaceDetails(workspaceId, userId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async getBookingHistory(userId, filter = 'all') {
        try {
            const bookings = await this.bookingRepository.getBookingHistory(userId, filter);
            return bookings;
        }
        catch (error) {
            throw error;
        }
    }
    async saveWorkspace(userId, workspaceId, isSaved) {
        try {
            const existingSave = await this.workspaceRepository.findSavedWorkspace(userId, workspaceId);
            let result;
            if (existingSave && !isSaved) {
                result = await this.workspaceRepository.saveWorkspace(userId, workspaceId, false);
            }
            else if (!existingSave && isSaved) {
                result = await this.workspaceRepository.saveWorkspace(userId, workspaceId, true);
            }
            else {
                result = { changed: false, status: isSaved };
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async userDetails(userId) {
        try {
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = userUseCase;
//# sourceMappingURL=userUseCase.js.map