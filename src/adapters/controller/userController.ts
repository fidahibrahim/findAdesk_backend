import { HttpStatusCode } from "../../constants/httpStatusCode";
import { ResponseMessage } from "../../constants/responseMssg";
import { AuthenticatedRequest } from "../../infrastructure/middleware/userAuth";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { IuserUseCase } from "../../interface/Usecase/IUserUseCase";
import { Request, Response } from "express"


export class UserController {
    private userUseCase: IuserUseCase

    constructor(userUseCase: IuserUseCase) {
        this.userUseCase = userUseCase
        this.register = this.register.bind(this)
        this.verifyOtp = this.verifyOtp.bind(this)
        this.resendOtp = this.resendOtp.bind(this)
        this.login = this.login.bind(this)
        this.googleLogin = this.googleLogin.bind(this)
        this.forgotPassword = this.forgotPassword.bind(this)
        this.getProfile = this.getProfile.bind(this)
        this.contactService = this.contactService.bind(this)
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const { username: name, email, password } = req.body
            if (!name || !email || !password) {
                res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json(handleError(ResponseMessage.FIELDS_REQUIRED, HttpStatusCode.BAD_REQUEST))
                return
            }
            const data = {
                name,
                email,
                password
            }
            const response = await this.userUseCase.register(data)

            res
                .status(HttpStatusCode.CREATED)
                .json(handleSuccess(ResponseMessage.USER_REGISTER_SUCCESS, HttpStatusCode.CREATED, response));

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(handleError(ResponseMessage.USER_REGISTER_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            const { otp, email } = req.body
            if (!email || !otp) {
                res.status(400).json({ status: false, message: "Email and OTP are required" });
                return;
            }
            const response = await this.userUseCase.verifyOtp(email, otp)
            if (!response?.status) {
                res.status(401).json(response)
                return
            }
            res.status(200).json(response)
        } catch (error) {
            res.json(error)
        }
    }

    async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body
            console.log(email, "email from body ");
            const response = await this.userUseCase.resendOtp(email)
            if (response == "ResendOtp successfull") {
                res.json({ status: 200 });
            } else {
                res.status(400).json({ message: "Invalid email" })
            }
        } catch (error) {
            res.json(error)
        }
    }
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            const data = {
                email,
                password
            }
            const response = await this.userUseCase.login(data)
            if (response?.status && response.message == "Logined Successfully") {
                const { token, refreshToken } = response
                res.cookie("userToken", token, {
                    httpOnly: true,
                    maxAge: 60 * 60 * 1000,
                }).cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                res.status(200).json({ status: true, message: 'Logined Successfully', user: response.user })
            } else if (
                response?.status === false && response.message == "Your account is blocked. Please contact support."
            ) {
                res.status(403).json({ status: false, message: response.message });
            }
            else if (
                !response?.status && response?.message == "Otp is not verified"
            ) {
                res.cookie("otpEmail", email, { maxAge: 3600000 })
                res.status(403).json({ isVerified: "false" });
            } else if (response?.status) {
                res.status(200).json(response);
            } else if (!response?.status && response?.message == "Incorrect Password") {
                res.status(403).json(response);
            } else {
                res.status(403).json(response);
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.LOGIN_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async logout(req: Request, res: Response) {
        try {
            res.cookie("userToken", "", { httpOnly: true, expires: new Date() }).cookie("userRefreshToken", "", { httpOnly: true, expires: new Date() })
            res
                .status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.LOGOUT_SUCCESS, HttpStatusCode.OK, { status: true }));
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.LOGOUT_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async googleLogin(req: Request, res: Response) {
        try {
            const { access_token } = req.body
            const response = await this.userUseCase.fetchGoogleUserDetails(access_token)
            if (response?.status && response.message == "Successfull") {
                const { token, refreshToken } = response
                res.cookie("userToken", token, {
                    httpOnly: true,
                    maxAge: 360000,
                }).cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                res
                    .status(200).json({ status: true, message: 'Successfull', user: response.user })
            }

        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.GOOGLE_LOGIN_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body
            const response = await this.userUseCase.validateForgotPassword(email)
            if (response == "Email sended to the user") {
                res.status(HttpStatusCode.OK)
                    .json(handleSuccess(ResponseMessage.MAIL_SEND_SUCCESSFULLY, HttpStatusCode.OK))
                return;
            } else if (response == "user not exist with this email") {
                res
                    .status(HttpStatusCode.FORBIDDEN)
                    .json(handleError(ResponseMessage.INVALID_MAIL, HttpStatusCode.FORBIDDEN));
                return;
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.PASSWORD_RESET_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const { token, password } = req.body
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.LOGOUT_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async contactService(req: Request, res: Response) {
        try {
            const { name, email, subject, message } = req.body
            const response = await this.userUseCase.contactService(name, email, subject, message)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.MAIL_SEND_SUCCESSFULLY, HttpStatusCode.OK, response))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FAILED_SENDING_MAIL, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async getProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.userId
            const response = await this.userUseCase.getProfile(userId)
            if (response) {
                res.status(HttpStatusCode.OK)
                    .json(handleSuccess(ResponseMessage.FETCH_PROFILE, HttpStatusCode.OK, response))
            } else {
                res.status(HttpStatusCode.NOT_FOUND)
                    .json(handleError(ResponseMessage.AUTHENTICATION_FAILURE, HttpStatusCode.NOT_FOUND));
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_PROFILE_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
}