import { IWorkspace } from "../entities/workspaceEntity";
import { createImageUrl, sendObjectToS3 } from "../infrastructure/utils/s3Bucket";
import { randomImageName, sharpImage } from "../infrastructure/utils/sharpedImages";
import { IOwnerRepository } from "../interface/Repository/ownerRepository";
import { IWorkspaceRepository } from "../interface/Repository/workspaceRepository";
import IWorkspaceUseCase, { IWorkspaceRes } from "../interface/Usecase/IWorkspaceUseCase";

export default class workspaceUseCase implements IWorkspaceUseCase {
    private workspaceRepository: IWorkspaceRepository;
    private ownerRepository: IOwnerRepository;

    constructor(
        workspaceRepository: IWorkspaceRepository,
        ownerRepository: IOwnerRepository
    ) {
        this.workspaceRepository = workspaceRepository
        this.ownerRepository = ownerRepository
    }

    async addWorkspace(data: IWorkspace): Promise<IWorkspaceRes<IWorkspace>> {
        try {
            const owner = await this.ownerRepository.checkOwnerExists(data.ownerId)
            if (!owner) {
                throw new Error("Owner doesn't exist with this ID")
            }
            const exist = await this.workspaceRepository.checkEmailExists(data.workspaceMail)
            if (exist) {
                throw new Error("Workspace already exists with this email")
            }
            const imageUrls = await Promise.all(
                data.images.map(async (file: any) => {
                    try {
                        // const sharpedImage = await sharpImage(2000, 2000, file.buffer);
                        const imageName = randomImageName();
                        await sendObjectToS3(imageName, file.mimetype, file.buffer);

                        return createImageUrl(imageName);
                    } catch (error) {
                        console.error("Error processing image:", error);
                        return null;
                    }
                })
            );
            const validImageUrls = imageUrls.filter(
                (url): url is string => url !== null
            )
            const workspaceData = { ...data, images: validImageUrls, status: "pending" as "pending" }
            const response = await this.workspaceRepository.addWorkspace(workspaceData)
            if (response) {
                return {
                    status: true,
                    message: "Successfully added your workspace",
                    data: workspaceData
                };
            } else {
                throw new Error("Something went wrong while adding the workspace")
            }

        } catch (error) {
            throw error
        }
    }
    async listWorkspaces(ownerId: string, search: string, page: number, limit: number) {
        try {
            const { workspaces, totalCount } = await this.workspaceRepository.listWorkspaces(ownerId, search, page, limit)
            const totalPages = Math.ceil(totalCount / limit)
            return { workspaces, totalPages }
        } catch (error) {
            throw error
        }
    }
    async viewDetails(workspaceId: string) {
        try {
            const response = await this.workspaceRepository.viewDetails(workspaceId)
            console.log(response, "from usecase")
            return response
        } catch (error) {
            throw error
        }
    }
}