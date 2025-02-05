import { IWorkspace } from "../../entities/workspaceEntity";

export interface IWorkspaceRepository {
    addWorkspace(data: IWorkspace): Promise<IWorkspace | null>
    checkEmailExists(email: string): Promise<IWorkspace | null>
    listWorkspaces(ownerId: string, search: string, page: number, limit: number): Promise<{ workspaces: IWorkspace[] | null, totalCount: number }>
    viewDetails(workspaceId: string): Promise<IWorkspace | null>
    deleteWorkspace(workspaceId: string): Promise<IWorkspace|null>
    editWorkspace(workspaceId: string, data: IWorkspace): Promise<IWorkspace | null>
}