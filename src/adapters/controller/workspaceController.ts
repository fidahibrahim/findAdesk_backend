import { Request, Response } from "express";
import IWorkspaceUseCase from "../../interface/Usecase/IWorkspaceUseCase";

export class workspaceController {
    private workspaceUseCase: IWorkspaceUseCase

    constructor(workspaceUseCase: IWorkspaceUseCase){
        this.workspaceUseCase = workspaceUseCase
        this.addWorkspace = this.addWorkspace.bind(this)
    }

    async addWorkspace(req: Request, res: Response) {
        try {
            const formData = {
                ...req.body,
                images: req.files
            }
            console.log(formData)
        } catch (error) {
           console.log(error) 
        }
    }
}