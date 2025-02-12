import { Model } from "mongoose";
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
        let parsedAmenities = [];
        try {
            parsedAmenities = typeof data.amenities === 'string'
                ? JSON.parse(data.amenities)
                : data.amenities;
        } catch (error) {
            console.error('Error parsing amenities:', error);
            parsedAmenities = [];
        }
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
                amenities: parsedAmenities,
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
            console.log(response, "response from repository")
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

            let parsedAmenities = data.amenities;
            if (typeof data.amenities === 'string') {
                try {
                    parsedAmenities = JSON.parse(data.amenities);
                } catch (e) {
                    parsedAmenities = [];
                }
            }

            const workspaceData = {
                ...data,
                amenities: parsedAmenities,
                startTime: new Date(`2024-02-05T${data.startTime}`),
                endTime: new Date(`2024-02-05T${data.endTime}`)
            };
            console.log(workspaceData, "workspacedata in repository")
            const updatedWorkspace = await this.workspace.findByIdAndUpdate(
                workspaceId,
                { $set: workspaceData },
                {
                    new: true,
                    runValidators: true
                }
            )

            console.log(updatedWorkspace, "updated workspace in repository")
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