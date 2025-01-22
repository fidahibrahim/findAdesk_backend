import IWorkspace from "../../entities/workspaceEntity";

export default interface IWorkspaceUseCase {
    addWorkspace(data: IWorkspace): Promise<IWorkspace>
}