import { Request, Response } from "express";

export interface IAdminController {
    login(req: Request, res:Response ): Promise<void>
    logout(req: Request, res:Response): Promise<void>
    getUsers(req: Request, res: Response): Promise<void>
    blockUser(req: Request, res: Response): Promise<void>
    getOwners(req: Request, res: Response): Promise<void>
    blockOwner(req: Request, res: Response): Promise<void>
}