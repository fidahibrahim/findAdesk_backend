import {IWorkspace} from "../../entities/workspaceEntity";

export interface IWorkspaceRes<IWorkspace> {
    status: boolean;
    message: string;
    data?: IWorkspace
}


export default interface IWorkspaceUseCase {
    addWorkspace(data: IWorkspace): Promise<IWorkspaceRes<IWorkspace>>
    listWorkspaces(ownerId: string | undefined): Promise<IWorkspace[]|null>
    viewDetails(workspaceId: string): Promise<IWorkspace|null>
}