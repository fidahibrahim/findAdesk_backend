import  { Model } from "mongoose";
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
    async listWorkspaces(ownerId: string, search: string, page: number, limit: number) {
        try {
            const filter = {
                ownerId,
                ...(search && {
                    $or: [
                        { workspaceName: { $regex: search, $options: "i" } },
                        { workspaceMail: { $regex: search, $options: "i" } },
                    ],
                }),
            };
            const workspaces = await this.workspace
                .find(filter)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ _id: -1 });
            const totalCount = await this.workspace.countDocuments(filter)
            return { workspaces, totalCount }
        } catch (error) {
            throw error
        }
    }
    async viewDetails(workspaceId: string) {
        try {
            const response = await this.workspace.findById(workspaceId)
            return response
        } catch (error) {
            throw error
        }
    }
    async deleteWorkspace(workspaceId: string) {
        try {
            const response = await this.workspace.findByIdAndDelete(workspaceId)
            return response
        } catch (error) {
            throw error
        }
    }
    async editWorkspace(workspaceId: string, data: IWorkspace) {
        try {
            const workspace = await this.workspace.findById(workspaceId)
            if (!workspace) {
                throw new Error('Workspace not found');
            }
            const workspaceData = {
                ...data,
                startTime: new Date(`2024-02-05T${data.startTime}`),
                endTime: new Date(`2024-02-05T${data.endTime}`)
            };
            const updatedWorkspace = await this.workspace.findByIdAndUpdate(
                workspaceId,
                { $set: workspaceData },
                {
                    new: true,
                    runValidators: true
                }
            )
            if (!updatedWorkspace) {
                throw new Error('Failed to update workspace');
            }    
            return updatedWorkspace
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}