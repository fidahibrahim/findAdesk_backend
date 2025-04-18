import IOwnerUseCase from "../../interface/Usecase/IOwnerUseCase";
import { Request, Response } from "express";
import { handleError, handleSuccess } from "../../infrastructure/utils/responseHandler";
import { ResponseMessage } from "../../constants/responseMssg";
import { HttpStatusCode } from "../../constants/httpStatusCode";
import { AuthenticatedRequest } from "../../infrastructure/middleware/ownerAuth";

export class ownerController {
    private ownerUseCase: IOwnerUseCase

    constructor(ownerUseCase: IOwnerUseCase) {
        this.ownerUseCase = ownerUseCase
        this.register = this.register.bind(this)
        this.verifyOtp = this.verifyOtp.bind(this)
        this.resendOtp = this.resendOtp.bind(this)
        this.login = this.login.bind(this)
        this.getDashboardData = this.getDashboardData.bind(this)
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const { username: name, email, password } = req.body
            if (!name || !email || !password) {
                res.status(400).json({
                    status: false,
                    message: "All fields are required"
                })
            }
            const data = {
                name,
                email,
                password
            }
            const response = await this.ownerUseCase.register(data)
            if (!response?.status && response.message == "This user already exist") {
                res.status(403).json({
                    status: false,
                    message: "user already exist with this email"
                })
                return;
            }
            res.status(200).json({
                message: "User created and otp send successfully",
                email: response.email
            });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.OWNER_REGISTER_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async verifyOtp(req: Request, res: Response) {
        try {
            const { otp, email } = req.body
            if (!email || !otp) {
                res.status(400).json({ status: false, message: "Email and OTP are required" });
                return;
            }
            const response = await this.ownerUseCase.ownerVerifyOtp(email, otp)
            if (!response?.status) {
                res.status(401).json(response)
                return
            }
            res.status(200).json(response)
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.OTP_VERIFICATION_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body
            const response = await this.ownerUseCase.resendOtp(email)
            if (response == "ResendOtp successfull") {
                res.json({ status: 200 });
            } else {
                res.status(400).json({ message: "Invalid email" })
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.OTP_VERIFICATION_FAILED, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const data = {
                email,
                password
            }
            const response = await this.ownerUseCase.login(data)
            if (response?.status && response.message == "Logined Successfully") {
                const { token, refreshToken } = response
                res.cookie("ownerToken", token, {
                    httpOnly: true,
                    secure: true, // 
                    sameSite: "none",
                    maxAge: 24 * 60 * 60 * 1000,
                }).cookie("ownerRefreshToken", refreshToken, {
                    httpOnly: true,
                    secure: true, // 
                    sameSite: "none",
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                res.status(200).json({ status: true, message: 'Logined Successfully', user: response.user })
            } else if (
                !response?.status && response?.message == "Otp is not verified"
            ) {
                res.cookie("otpEmail", email, {
                    httpOnly: true,
                    secure: true, // 
                    sameSite: "none", maxAge: 3600000
                })
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
            res.cookie("ownerToken", "", {
                httpOnly: true,
                secure: true, // 
                sameSite: "none", expires: new Date()
            })
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.LOGOUT_SUCCESS, HttpStatusCode.OK))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.LOGOUT_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

    async getDashboardData(req: AuthenticatedRequest, res: Response) {
        try {
            const ownerId = req.owner?.userId
            const response = await this.ownerUseCase.getDashboardData(ownerId!)
            res.status(HttpStatusCode.OK)
                .json(handleSuccess(ResponseMessage.FETCH_DASHBOARD, HttpStatusCode.OK, response))
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json(handleError(ResponseMessage.FETCH_DASHBOARD_FAILURE, HttpStatusCode.INTERNAL_SERVER_ERROR))
        }
    }

}