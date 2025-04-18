"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownerController = void 0;
const responseHandler_1 = require("../../infrastructure/utils/responseHandler");
const responseMssg_1 = require("../../constants/responseMssg");
const httpStatusCode_1 = require("../../constants/httpStatusCode");
class ownerController {
    constructor(ownerUseCase) {
        this.ownerUseCase = ownerUseCase;
        this.register = this.register.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.resendOtp = this.resendOtp.bind(this);
        this.login = this.login.bind(this);
        this.getDashboardData = this.getDashboardData.bind(this);
    }
    async register(req, res) {
        try {
            const { username: name, email, password } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({
                    status: false,
                    message: "All fields are required"
                });
            }
            const data = {
                name,
                email,
                password
            };
            const response = await this.ownerUseCase.register(data);
            if (!(response === null || response === void 0 ? void 0 : response.status) && response.message == "This user already exist") {
                res.status(403).json({
                    status: false,
                    message: "user already exist with this email"
                });
                return;
            }
            res.status(200).json({
                message: "User created and otp send successfully",
                email: response.email
            });
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.OWNER_REGISTER_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async verifyOtp(req, res) {
        try {
            const { otp, email } = req.body;
            if (!email || !otp) {
                res.status(400).json({ status: false, message: "Email and OTP are required" });
                return;
            }
            const response = await this.ownerUseCase.ownerVerifyOtp(email, otp);
            if (!(response === null || response === void 0 ? void 0 : response.status)) {
                res.status(401).json(response);
                return;
            }
            res.status(200).json(response);
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.OTP_VERIFICATION_FAILED, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            const response = await this.ownerUseCase.resendOtp(email);
            if (response == "ResendOtp successfull") {
                res.json({ status: 200 });
            }
            else {
                res.status(400).json({ message: "Invalid email" });
            }
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.OTP_VERIFICATION_FAILED, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = {
                email,
                password
            };
            const response = await this.ownerUseCase.login(data);
            if ((response === null || response === void 0 ? void 0 : response.status) && response.message == "Logined Successfully") {
                const { token, refreshToken } = response;
                res.cookie("ownerToken", token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000,
                }).cookie("ownerRefreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                });
                res.status(200).json({ status: true, message: 'Logined Successfully', user: response.user });
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
            res.cookie("ownerToken", "", { httpOnly: true, expires: new Date() });
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.LOGOUT_SUCCESS, httpStatusCode_1.HttpStatusCode.OK));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.LOGOUT_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
    async getDashboardData(req, res) {
        var _a;
        try {
            const ownerId = (_a = req.owner) === null || _a === void 0 ? void 0 : _a.userId;
            const response = await this.ownerUseCase.getDashboardData(ownerId);
            res.status(httpStatusCode_1.HttpStatusCode.OK)
                .json((0, responseHandler_1.handleSuccess)(responseMssg_1.ResponseMessage.FETCH_DASHBOARD, httpStatusCode_1.HttpStatusCode.OK, response));
        }
        catch (error) {
            res.status(httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json((0, responseHandler_1.handleError)(responseMssg_1.ResponseMessage.FETCH_DASHBOARD_FAILURE, httpStatusCode_1.HttpStatusCode.INTERNAL_SERVER_ERROR));
        }
    }
}
exports.ownerController = ownerController;
//# sourceMappingURL=ownerController.js.map