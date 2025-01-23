import { Model } from "mongoose";
import { IWorkspaceRepository } from "../../interface/Repository/workspaceRepository";
import {IWorkspace} from "../../entities/workspaceEntity";

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
                workspaceType: data.workspaceType,
                capacity: data.capacity,
                place: data.place,
                street: data.street,
                state: data.state,
                spaceDescription: data.spaceDescription,
                startTime: data.startTime,
                endTime: data.endTime,
                workingDays: data.workingDays,
                pricePerHour: data.pricePerHour,
                workspaceRules: data.workspaceRules,
                aminities: data.aminities,
                images: data.images
            })
            return await workspaceData.save()
        } catch (error) {
            return null
        }
    }
}