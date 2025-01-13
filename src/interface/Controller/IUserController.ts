import { Request, Response } from "express";

export interface IRegisterBody {
    name: string;
    email: string;
    password: string
    status?: boolean
    message?: string
}

export interface IUserController{
    login(req: Request, res: Response): Promise<void>
    register(req: Request, res: Response): Promise<void>
    verifyOtp(req: Request, res: Response): Promise<void>
    resendOtp(req: Request, res: Response): Promise<void>
    googleLogin(req: Request, res: Response): Promise<void>
}