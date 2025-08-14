"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const httpStatusCode_1 = require("../../constants/httpStatusCode");
const responseMssg_1 = require("../../constants/responseMssg");
const responseHandler_1 = require("../../infrastructure/utils/responseHandler");
const stripe_1 = __importDefault(require("stripe"));
class UserController {
    constructor(userUseCase) {
        this.userUseCase = userUseCase;
        this.register = this.register.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.resendOtp = this.resendOtp.bind(this);
        this.login = this.login.bind(this);
        this.googleLogin = this.googleLogin.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.editProfile = this.editProfile.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.contactService = this.contactService.bind(this);
        this.getRecentWorkspaces = this.getRecentWorkspaces.bind(this);
        this.filterWorkspaces = this.filterWorkspaces.bind(this);
        this.workspaceDetails = this.workspaceDetails.bind(this);
        this.getBookingHistory = this.getBookingHistory.bind(this);
        this.saveWorkspace = this.saveWorkspace.bind(this);
        this.addSubscription = this.addSubscription.bind(this);
        this.verifySubscription = this.verifySubscription.bind(this);
    }
    async register(req, res) {
        try {
            const { username: name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(httpStatusCode_1.HttpStatusCode.BAD_REQUEST)
                    .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FIELDS_REQUIRED, httpStatusCode_1.HttpStatusCode.BAD_REQUEST));
                return;
            }
            const data = { name, email, password };
            const response = await this.userUseCase.register(data);
            res.status(httpStatusCode_1.HttpStatusCode.CREATED)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.USER_REGISTER_SUCCESS, httpStatusCode_1.HttpStatusCode.CREATED, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.USER_REGISTER_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async verifyOtp(req, res) {
        try {
            const { otp, email } = req.body;
            if (!email || !otp) {
                res.status(400).json({ status: false, message: "Email and OTP are required" });
                return;
            }
            const response = await this.userUseCase.verifyOtp(email, otp);
            if (!(response === null || response === void 0 ? void 0 : response.status)) {
                res.status(401).json(response);
                return;
            }
            res.status(200).json(response);
        }
        catch (error) {
            res.json(error);
        }
    }
    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            const response = await this.userUseCase.resendOtp(email);
            if (response == "ResendOtp successfull") {
                res.json({ status: 200 });
            }
            else {
                res.status(400).json({ message: "Invalid email" });
            }
        }
        catch (error) {
            res.json(error);
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = {
                email,
                password
            };
            const response = await this.userUseCase.login(data);
            if ((response === null || response === void 0 ? void 0 : response.status) && response.message == "Logined Successfully") {
                const { token, refreshToken } = response;
                res.cookie("userToken", token, {
                    httpOnly: true,
                    // secure: false,
                    // sameSite: 'strict' ,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 60 * 60 * 1000,
                }).cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    // secure: false,
                    // sameSite: 'strict' ,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                res.status(200).json({ status: true, message: 'Logined Successfully', user: response.user });
            }
            else if ((response === null || response === void 0 ? void 0 : response.status) === false && response.message == "Your account is blocked. Please contact support.") {
                res.status(403).json({ status: false, message: response.message });
            }
            else if (!(response === null || response === void 0 ? void 0 : response.status) && (response === null || response === void 0 ? void 0 : response.message) == "Otp is not verified") {
                res.cookie("otpEmail", email, { maxAge: 3600000 });
                res.status(403).json({ isVerified: "false" });
            }
            else if (response === null || response === void 0 ? void 0 : response.status) {
                res.status(200).json(response);
            }
            else if (!(response === null || response === void 0 ? void 0 : response.status) && (response === null || response === void 0 ? void 0 : response.message) == "Incorrect Password") {
                res.status(403).json(response);
            }
            else {
                res.status(403).json(response);
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.LOGIN_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async logout(req, res) {
        try {
            res.cookie("userToken", "", {
                httpOnly: true,
                // secure: false,
                // sameSite: 'strict' ,
                secure: true,
                sameSite: 'none',
                expires: new Date()
            }).cookie("userRefreshToken", "", {
                httpOnly: true,
                // secure: false,
                // sameSite: 'strict',
                secure: true,
                sameSite: 'none',
                expires: new Date()
            });
            res
                .status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.LOGOUT_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, { status: true }));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.LOGOUT_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async googleLogin(req, res) {
        try {
            const { access_token } = req.body;
            const response = await this.userUseCase.fetchGoogleUserDetails(access_token);
            if ((response === null || response === void 0 ? void 0 : response.status) && response.message == "Successfull") {
                const { token, refreshToken } = response;
                res.cookie("userToken", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 360000,
                }).cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 30 * 24 * 60 * 60 * 1000
                });
                res
                    .status(200).json({ status: true, message: 'Successfull', user: response.user });
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.GOOGLE_LOGIN_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const response = await this.userUseCase.validateForgotPassword(email);
            if (response == "Email sended to the user") {
                res.status(httpStatusCode_1.HttpStatusCode.OK)
                    .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.MAIL_SEND_SUCCESSFULLY, httpStatusCode_1.HttpStatusCode.OK));
                return;
            }
            else if (response == "user not exist with this email") {
                res
                    .status(httpStatusCode_1.HttpStatusCode.FORBIDDEN)
                    .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.INVALID_MAIL, httpStatusCode_1.HttpStatusCode.FORBIDDEN));
                return;
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.PASSWORD_RESET_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async changePassword(req, res) {
        try {
            const { token, password } = req.body;
            await this.userUseCase.changePassword(token, password);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.PASSWORD_RESET_SUCCESS, httpStatusCode_1.HttpStatusCode.OK));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.PASSWORD_RESET_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async contactService(req, res) {
        try {
            const { name, email, subject, message } = req.body;
            const response = await this.userUseCase.contactService(name, email, subject, message);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.MAIL_SEND_SUCCESSFULLY, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FAILED_SENDING_MAIL, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getProfile(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const response = await this.userUseCase.getProfile(userId);
            if (response) {
                (0, responseHandler_1.sendResponse)(res, (0, responseHandler_1.handleSuccesss)(responseMssg_1.ResponseMessage.FETCH_PROFILE, httpStatusCode_1.HttpStatusCode.OK, response));
            }
            else {
                (0, responseHandler_1.sendResponse)(res, (0, responseHandler_1.handleErrorr)(responseMssg_1.ResponseMessage.AUTHENTICATION_FAILURE, httpStatusCode_1.HttpStatusCode.NOT_FOUND));
            }
        }
        catch (error) {
            (0, responseHandler_1.sendResponse)(res, (0, responseHandler_1.handleErrorr)(responseMssg_1.ResponseMessage.FETCH_PROFILE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR, error));
        }
    }
    async editProfile(req, res) {
        try {
            const formData = {
                ...req.body,
                image: req.file,
            };
            console.log(formData, 'formdata');
            const response = await this.userUseCase.editProfile(formData);
            if (response) {
                res.status(httpStatusCode_1.HttpStatusCode.OK)
                    .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.UPDATE_PROFILE_SUCCESS, httpStatusCode_1.HttpStatusCode.OK));
            }
        }
        catch (error) {
            console.log(error);
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.UPDATE_PROFILE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async resetPassword(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { currentPassword, newPassword } = req.body;
            await this.userUseCase.resetPassword(userId, currentPassword, newPassword);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.PASSWORD_RESET_SUCCESS, httpStatusCode_1.HttpStatusCode.OK));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.PASSWORD_RESET_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getBookingHistory(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const filter = req.query.filter || 'all';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const response = await this.userUseCase.getBookingHistory(userId, filter, page, limit);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.BOOKING_VIEWDETAILS_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getRecentWorkspaces(req, res) {
        try {
            const response = await this.userUseCase.getRecentWorkspaces();
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_WORKSPACE_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async filterWorkspaces(req, res) {
        try {
            const filters = req.body;
            const workspaces = await this.userUseCase.searchWorkspaces(filters);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_WORKSPACE_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, workspaces));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async workspaceDetails(req, res) {
        var _a;
        try {
            const workspaceId = req.query.workspaceId;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const response = await this.userUseCase.workspaceDetails(workspaceId, userId);
            if (response) {
                res.status(httpStatusCode_1.HttpStatusCode.OK)
                    .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.WORKSPACE_VIEW_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, response));
            }
            else {
                res.status(httpStatusCode_1.HttpStatusCode.NOT_FOUND)
                    .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_NOT_FOUND, httpStatusCode_1.HttpStatusCode.NOT_FOUND));
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.WORKSPACE_VIEW_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async saveWorkspace(req, res) {
        var _a;
        try {
            const { workspaceId, isSaved } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const result = await this.userUseCase.saveWorkspace(userId, workspaceId, isSaved);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.SAVE_WORKSPACE_SUCCESS, httpStatusCode_1.HttpStatusCode.OK, result));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.SAVE_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async addSubscription(req, res) {
        var _a;
        try {
            const { planType, amount } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!process.env.STRIPE_SECRET_KEY) {
                throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
            }
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: planType,
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                metadata: {
                    userId: userId,
                    planType: planType,
                    amount: amount,
                },
                success_url: `${process.env.SUCCESS_URL_PRO}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.SUCCESS_URL_PRO}/profile`,
            });
            res.status(httpStatusCode_1.HttpStatusCode.OK).json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.SUBSCRIPTION_SESSION, httpStatusCode_1.HttpStatusCode.OK, session));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR).json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.SAVE_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async verifySubscription(req, res) {
        var _a, _b, _c;
        try {
            const { sessionId } = req.params;
            if (!process.env.STRIPE_SECRET_KEY) {
                throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
            }
            const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
            const userDetails = await this.userUseCase.userDetails(userId);
            if (session.payment_status === "paid") {
                const planType = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.planType;
                const subscriptionStartDate = new Date();
                let subscriptionEndDate = new Date();
                if (planType === 'monthly') {
                    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
                }
                else if (planType === 'yearly') {
                    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
                }
                userDetails.isSubscribed = true;
                userDetails.subscriptionType = planType;
                userDetails.subscriptionStartDate = subscriptionStartDate;
                userDetails.subscriptionEndDate = subscriptionEndDate;
                await userDetails.save();
                const result = {
                    planType: planType,
                    amount: parseInt((_c = session.metadata) === null || _c === void 0 ? void 0 : _c.amount),
                    subscriptionEndDate: subscriptionEndDate
                };
                res.status(httpStatusCode_1.HttpStatusCode.OK).json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.SUBSCRIPTION_VERIFIED, httpStatusCode_1.HttpStatusCode.OK, result));
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR).json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.SAVE_WORKSPACE_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map