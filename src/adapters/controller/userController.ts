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
            const response = await this.userUseCase.register(data)
            if (!response?.status && response.message == "This user already exist") {
                res.status(403).json({
                    status: false,
                    message: "user already exist with this email"
                })
                return;
            }
            res.status(200).json({
                message: "User created and otp sended successfully",
                email: response.email
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            const errorCode = (error as any).code || 500
            res.status(errorCode).json(errorMessage)
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
                    maxAge: 360000,
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
            console.log(error);
        }
    }

    async logout(req: Request, res: Response) {
        try {
            res.cookie("userToken", "", { httpOnly: true, expires: new Date() }).cookie("userRefreshToken", "", { httpOnly: true, expires: new Date() })
            res.status(200).json({ status: true })
        } catch (error) {
            console.log(error);
            res.json(error)
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
                res.status(200).json({ status: true, message: 'Successfull', user: response.user })
            }

        } catch (error) {
            console.log(error)
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body
            const response = await this.userUseCase.validateForgotPassword(email)
            if (response == "Email sended to the user") {
                res.status(200).json({ message: "email send succesfully" });
                return;
            } else if (response == "user not exist with this email") {
                res
                    .status(403)
                    .json({ message: "User not exist with this email" });
                return;
            }
        } catch (error) {
            console.log(error)
        }
    }
}