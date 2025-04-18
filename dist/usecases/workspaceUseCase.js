"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s3Bucket_1 = require("../infrastructure/utils/s3Bucket");
const sharpedImages_1 = require("../infrastructure/utils/sharpedImages");
class workspaceUseCase {
    constructor(workspaceRepository, ownerRepository) {
        this.workspaceRepository = workspaceRepository;
        this.ownerRepository = ownerRepository;
    }
    async addWorkspace(data) {
        try {
            const owner = await this.ownerRepository.checkOwnerExists(data.ownerId);
            if (!owner) {
                throw new Error("Owner doesn't exist with this ID");
            }
            const exist = await this.workspaceRepository.checkEmailExists(data.workspaceMail);
            if (exist) {
                throw new Error("Workspace already exists with this email");
            }
            const imageUrls = await Promise.all(data.images.map(async (file) => {
                try {
                    const sharpedImage = await (0, sharpedImages_1.sharpImage)(2000, 2000, file.buffer);
                    const imageName = (0, sharpedImages_1.randomImageName)();
                    await (0, s3Bucket_1.sendObjectToS3)(imageName, file.mimetype, file.buffer, sharpedImage);
                    return (0, s3Bucket_1.createImageUrl)(imageName);
                }
                catch (error) {
                    console.error("Error processing image:", error);
                    return null;
                }
            }));
            const validImageUrls = imageUrls.filter((url) => url !== null);
            const workspaceData = { ...data, images: validImageUrls, status: "pending" };
            const response = await this.workspaceRepository.addWorkspace(workspaceData);
            if (response) {
                return {
                    status: true,
                    message: "Successfully added your workspace",
                    data: workspaceData
                };
            }
            else {
                throw new Error("Something went wrong while adding the workspace");
            }
        }
        catch (error) {
            throw error;
        }
    }
    async listWorkspaces(ownerId, search, page, limit) {
        try {
            const { workspaces, totalCount } = await this.workspaceRepository.listWorkspaces(ownerId, search, page, limit);
            const totalPages = Math.ceil(totalCount / limit);
            return { workspaces, totalPages };
        }
        catch (error) {
            throw error;
        }
    }
    async viewDetails(workspaceId) {
        try {
            const response = await this.workspaceRepository.viewDetails(workspaceId);
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteWorkspace(workspaceId) {
        try {
            const response = await this.workspaceRepository.deleteWorkspace(workspaceId);
            if (response) {
                return "deleted successfully";
            }
            else {
                return "failed to delete";
            }
        }
        catch (error) {
            throw error;
        }
    }
    async editWorkspace(workspaceId, data) {
        try {
            const newImageUrls = data.newImages ? await Promise.all(data.newImages.map(async (file) => {
                try {
                    const sharpedImage = await (0, sharpedImages_1.sharpImage)(2000, 2000, file.buffer);
                    const imageName = (0, sharpedImages_1.randomImageName)();
                    await (0, s3Bucket_1.sendObjectToS3)(imageName, file.mimetype, file.buffer, sharpedImage);
                    return (0, s3Bucket_1.createImageUrl)(imageName);
                }
                catch (error) {
                    console.error("Error processing image:", error);
                    return null;
                }
            })) : [];
            const validNewImageUrls = newImageUrls.filter((url) => url !== null);
            const allImages = [...(data.existingImages || []), ...validNewImageUrls];
            const workspaceData = {
                ...data,
                images: allImages
            };
            delete workspaceData.newImages;
            delete workspaceData.existingImages;
            const response = await this.workspaceRepository.editWorkspace(workspaceId, workspaceData);
            if (response) {
                return {
                    status: true,
                    message: "Successfully added your workspace",
                    data: workspaceData
                };
            }
            else {
                throw new Error("Something went wrong while adding the workspace");
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = workspaceUseCase;
//# sourceMappingURL=workspaceUseCase.js.map