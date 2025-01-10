import IOwnerUseCase from "../../interface/Usecase/IOwnerUseCase";
import { Request, Response } from "express";

export class ownerController {
    private ownerUseCase: IOwnerUseCase

    constructor(ownerUseCase: IOwnerUseCase) {
        this.ownerUseCase = ownerUseCase
        this.register = this.register.bind(this)
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
            const response = await this.ownerUseCase.verifyOtp(email, otp)
            if (!response?.status) {
                res.status(401).json(response)
                return
            }
            res.status(200).json(response)
        } catch (error) {
            res.json(error)
        }
    }
    async resendOtp(req: Request, res: Response){
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
}