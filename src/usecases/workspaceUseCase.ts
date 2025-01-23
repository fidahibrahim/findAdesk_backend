import { IWorkspace } from "../entities/workspaceEntity";
import { createImageUrl, sendObjectToS3 } from "../infrastructure/utils/s3Bucket";
import { randomImageName, sharpImage } from "../infrastructure/utils/sharpedImages";
import { IOwnerRepository } from "../interface/Repository/ownerRepository";
import { IWorkspaceRepository } from "../interface/Repository/workspaceRepository";
import IWorkspaceUseCase from "../interface/Usecase/IWorkspaceUseCase";

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

    async addWorkspace(data: IWorkspace) {
        try {
            const owner = await this.ownerRepository.checkOwnerExists(data.ownerId)
            if (!owner) {
                throw new Error("owner doesnt exist with this id");
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
            console.log(validImageUrls, "vaaaaaaa");

            const workspaceData = { ...data, images: validImageUrls }
            const response = await this.workspaceRepository.addWorkspace(workspaceData)

            if (response) {
                return "successfully added your workspace"
            } else {
                return "something went wrong"
            }

        } catch (error) {
            console.error(error)
        }
    }
}