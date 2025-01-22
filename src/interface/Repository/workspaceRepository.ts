import IWorkspace from "../../entities/workspaceEntity";

export interface IWorkspaceRepository {
    addWorkspace(data: IWorkspace): Promise<IWorkspace | null>
}