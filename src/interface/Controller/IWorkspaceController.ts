import { Request, Response } from "express";

export interface IWorkspace {
    addWorkspace(req: Request, res: Response): Promise<void>
    listWorkspaces(req: Request, res: Response): Promise<void>
}