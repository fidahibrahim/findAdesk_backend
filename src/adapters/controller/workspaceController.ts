import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure/middleware/ownerAuth";
import IWorkspaceUseCase from "../../interface/Usecase/IWorkspaceUseCase";

export class workspaceController {
    private workspaceUseCase: IWorkspaceUseCase

    constructor(workspaceUseCase: IWorkspaceUseCase){
        this.workspaceUseCase = workspaceUseCase
        this.addWorkspace = this.addWorkspace.bind(this)
    }

    async addWorkspace(req: AuthenticatedRequest, res: Response) {
        try {

            const formData = {
                ...req.body,
                images: req.files,
                ownerId: req.owner?.userId
            }
            const response = await this.workspaceUseCase.addWorkspace(formData)
            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }
}