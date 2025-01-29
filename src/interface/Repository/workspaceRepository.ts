import { IWorkspace } from "../../entities/workspaceEntity";

export interface IWorkspaceRepository {
    addWorkspace(data: IWorkspace): Promise<IWorkspace | null>
    checkEmailExists(email: string): Promise<IWorkspace | null>
    listWorkspaces(ownerId: string): Promise<IWorkspace[]| null>
    viewDetails(workspaceId: string): Promise<IWorkspace|null>
}