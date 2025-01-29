import mongoose, { Model } from "mongoose";
import { IWorkspaceRepository } from "../../interface/Repository/workspaceRepository";
import { IWorkspace } from "../../entities/workspaceEntity";

export default class workspaceRepository implements IWorkspaceRepository {
    private workspace: Model<IWorkspace>
    constructor(
        workspace: Model<IWorkspace>,
    ) {
        this.workspace = workspace
    }
    async addWorkspace(data: IWorkspace): Promise<IWorkspace | null> {
        try {
            const workspaceData = new this.workspace({
                ownerId: data.ownerId,
                workspaceName: data.workspaceName,
                workspaceMail: data.workspaceMail,
                workspaceType: data.workspaceType,
                capacity: Number(data.capacity),
                place: data.place,
                street: data.street,
                state: data.state,
                spaceDescription: data.spaceDescription,
                startTime: new Date(JSON.parse(data.startTime)),
                endTime: new Date(JSON.parse(data.endTime)),
                workingDays: data.workingDays,
                pricePerHour: Number(data.pricePerHour),
                workspaceRules: data.workspaceRules,
                aminities: data.amenities,
                images: data.images,
                status: "pending",
            })
            return await workspaceData.save()
        } catch (error) {
            throw error
        }
    }
    async checkEmailExists(workspaceMail: string) {
        try {
            return await this.workspace.findOne({ workspaceMail })
        } catch (error) {
            throw error
        }
    }
    async listWorkspaces(ownerId: string): Promise<IWorkspace[]|null>
    {
        try {
            const response = await this.workspace.find({ ownerId })  
            return response
        } catch (error) {
            throw error
        }
    }
    async viewDetails(workspaceId: string){
        try {
            const response = await this.workspace.findById( workspaceId )
            console.log(response,"res from repo")
            return response
        } catch (error) {
            throw error
        }
    }
}