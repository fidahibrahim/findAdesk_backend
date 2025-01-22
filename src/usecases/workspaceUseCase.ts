import IWorkspace from "../entities/workspaceEntity";
import { IWorkspaceRepository } from "../interface/Repository/workspaceRepository";
import IWorkspaceUseCase from "../interface/Usecase/IWorkspaceUseCase";

export default class workspaceUseCase implements IWorkspaceUseCase {
    private workspaceRepository: IWorkspaceRepository;

    constructor(
        workspaceRepository: IWorkspaceRepository,
    ) {
        this.workspaceRepository = workspaceRepository
    }

    async addWorkspace(data: IWorkspace): Promise<IWorkspace> {
        try {
            
        } catch (error) {
            
        }
    }
}