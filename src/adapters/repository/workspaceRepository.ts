import { Model } from "mongoose";
import { IWorkspaceRepository } from "../../interface/Repository/workspaceRepository";
import IWorkspace from "../../entities/workspaceEntity";

export default class workspaceRepository implements IWorkspaceRepository {
    private workspace: Model<IWorkspace>
    constructor(
        workspace: Model<IWorkspace>,
    ) {
        this.workspace = workspace
    }
    async addWorkspace(data: IWorkspace): Promise<IWorkspace | null> {
        try {
            
        } catch (error) {
            
        }
    }
}