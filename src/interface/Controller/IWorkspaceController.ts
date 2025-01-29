import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/middleware/ownerAuth";

export interface IWorkspace {
    addWorkspace(req: Request, res: Response): Promise<void>
    listWorkspaces(req: Request, res: Response): Promise<void>
}