import IOwnerUseCase from "../../interface/Usecase/IOwnerUseCase";
import { Request, Response } from "express";

export class ownerController {
    private ownerUseCase: IOwnerUseCase

    constructor(ownerUseCase: IOwnerUseCase) {
        this.ownerUseCase = ownerUseCase
        this.register = this.register.bind(this)
        this.verifyOtp = this.verifyOtp.bind(this)
        this.resendOtp = this.resendOtp.bind(this)
        this.login = this.login.bind(this)
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
            const response = await this.ownerUseCase.ownerVerifyOtp(email, otp)
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
            const response = await this.ownerUseCase.resendOtp(email)
            if (response == "ResendOtp successfull") {
                res.json({ status: 200 });
            } else {
                res.status(400).json({ message: "Invalid email" })
            }
        } catch (error) {
            res.json(error)
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
                    maxAge: 60 * 60 * 1000,
                }).cookie("ownerRefreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                res.status(200).json({ status: true, message: 'Logined Successfully', user: response.user })
            } else if (
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
            res.json(error)
        }
    }
    async logout(req: Request, res: Response) {
        try {
            res.cookie("ownerToken", "", { httpOnly: true, expires: new Date() })
            res.status(200).json({ status: true })
        } catch (error) {
            console.log(error)
        }
    }
    
}