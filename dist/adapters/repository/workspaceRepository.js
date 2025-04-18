"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class workspaceRepository {
    constructor(workspace, savedWorkspace) {
        this.workspace = workspace;
        this.savedWorkspace = savedWorkspace;
    }
    async addWorkspace(data) {
        let parsedAmenities = [];
        try {
            parsedAmenities = typeof data.amenities === 'string'
                ? JSON.parse(data.amenities)
                : data.amenities;
        }
        catch (error) {
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
            });
            return await workspaceData.save();
        }
        catch (error) {
            throw error;
        }
    }
    async findWorkspace(workspaceId) {
        try {
            return await this.workspace.findById(workspaceId);
        }
        catch (error) {
            throw error;
        }
    }
    async checkEmailExists(workspaceMail) {
        try {
            return await this.workspace.findOne({ workspaceMail });
        }
        catch (error) {
            throw error;
        }
    }
    async listWorkspaces(ownerId, search, page, limit) {
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
            const totalCount = await this.workspace.countDocuments(filter);
            return { workspaces, totalCount };
        }
        catch (error) {
            throw error;
        }
    }
    async viewDetails(workspaceId) {
        try {
            const response = await this.workspace.findById(workspaceId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteWorkspace(workspaceId) {
        try {
            const response = await this.workspace.findByIdAndDelete(workspaceId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async editWorkspace(workspaceId, data) {
        try {
            const workspace = await this.workspace.findById(workspaceId);
            if (!workspace) {
                throw new Error('Workspace not found');
            }
            let parsedAmenities = data.amenities;
            if (typeof data.amenities === 'string') {
                try {
                    parsedAmenities = JSON.parse(data.amenities);
                }
                catch (e) {
                    parsedAmenities = [];
                }
            }
            const workspaceData = {
                ...data,
                amenities: parsedAmenities,
                startTime: new Date(`2024-02-05T${data.startTime}`),
                endTime: new Date(`2024-02-05T${data.endTime}`)
            };
            const updatedWorkspace = await this.workspace.findByIdAndUpdate(workspaceId, { $set: workspaceData }, {
                new: true,
                runValidators: true
            });
            if (!updatedWorkspace) {
                throw new Error('Failed to update workspace');
            }
            return updatedWorkspace;
        }
        catch (error) {
            throw error;
        }
    }
    async findSavedWorkspace(userId, workspaceId) {
        try {
            const savedWorkspace = await this.savedWorkspace.findOne({
                userId, workspaceId, isActive: true
            });
            console.log(savedWorkspace, 'saved workspace in repository');
            return savedWorkspace;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async saveWorkspace(userId, workspaceId, isSaved) {
        try {
            if (isSaved) {
                const savedWorkspace = await this.savedWorkspace.findOneAndUpdate({ userId, workspaceId }, {
                    userId,
                    workspaceId,
                    isActive: true,
                }, { upsert: true, new: true });
                return {
                    savedWorkspace,
                    saved: true
                };
            }
            else {
                const savedWorkspace = await this.savedWorkspace.findOneAndUpdate({ userId, workspaceId }, { isActive: false }, { new: true });
                return {
                    savedWorkspace,
                    saved: false
                };
            }
        }
        catch (error) {
            throw error;
        }
    }
    async updateBookedSeats(workspaceId, seats) {
        try {
            if (typeof seats !== 'number' || isNaN(seats)) {
                throw new Error('Invalid seats value: ' + seats);
            }
            console.log('Valid seats value:', seats);
            return await this.workspace.findByIdAndUpdate(workspaceId, {
                $inc: { bookedSeats: -seats }
            }, { new: true });
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
exports.default = workspaceRepository;
//# sourceMappingURL=workspaceRepository.js.map