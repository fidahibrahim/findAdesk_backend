import { Request, Response } from "express";

export interface IRegisterBody {
    name: string;
    email: string;
    password?: string
    status?: boolean
    message?: string
}
export interface IRegister {
    _id: string
    name: string;
    email: string;
    image: string | undefined;
}

export interface IUserController{
    login(req: Request, res: Response): Promise<void>
    register(req: Request, res: Response): Promise<void>
    verifyOtp(req: Request, res: Response): Promise<void>
    resendOtp(req: Request, res: Response): Promise<void>
    googleLogin(req: Request, res: Response): Promise<void>
    forgotPassword(req: Request, res: Response): void
    changePassword(req: Request, res: Response): Promise<void>
    contactService(req: Request, res: Response): Promise<void>
    getProfile(req: Request, res: Response): Promise<void>
    editProfile(req: Request, res: Response): Promise<void>
    resetPassword(req: Request, res: Response): Promise<void>
    getBookingHistory(req: Request, res: Response): Promise<void>
    getRecentWorkspaces(req: Request, res: Response): Promise<void>
    filterWorkspaces(req: Request, res: Response): Promise<void>
    workspaceDetails(req: Request, res: Response): Promise<void>
}