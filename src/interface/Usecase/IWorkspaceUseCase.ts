import {IWorkspace} from "../../entities/workspaceEntity";

export interface IWorkspaceRes<IWorkspace> {
    status: boolean;
    message: string;
    data?: IWorkspace
}


export default interface IWorkspaceUseCase {
    addWorkspace(data: IWorkspace): Promise<IWorkspaceRes<IWorkspace>>
    listWorkspaces(ownerId: string | undefined, search: string, page: number, limit: number): Promise<{ workspaces: IWorkspace[]|null; totalPages: number}>
    viewDetails(workspaceId: string): Promise<IWorkspace|null>
}