import {editWorkspaceData, IWorkspace} from "../../entities/workspaceEntity";

export interface IWorkspaceRes<IWorkspace> {
    status: boolean;
    message: string;
    data?: IWorkspace
}

export default interface IWorkspaceUseCase {
    addWorkspace(data: IWorkspace): Promise<IWorkspaceRes<IWorkspace>>
    listWorkspaces(ownerId: string | undefined, search: string, page: number, limit: number): Promise<{ workspaces: IWorkspace[]|null; totalPages: number}>
    viewDetails(workspaceId: string): Promise<IWorkspace|null>
    deleteWorkspace(workspaceId: string): Promise<string|null>
    editWorkspace( workspaceId: string, data: IWorkspace ): Promise<IWorkspaceRes<editWorkspaceData>>
}