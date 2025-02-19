import IOwner from "../../entities/ownerEntity"
import Iuser from "../../entities/userEntity"
import { IWorkspace } from "../../entities/workspaceEntity"

export interface logAdmin {
    name: string
    email: string
}

export interface returnData {
    message: string,
    token?: string
    adminRefreshToken?: string
    admin?: logAdmin
}

export interface IadminUseCase {
    login(email: string, password: string): Promise<returnData | void>
    getUsers(search: string, page: number, limit: number): Promise<{ users: Iuser[]; totalPages: number }>
    blockUser(id: string): Promise<string | null>
    getOwners(search: string, page: number, limit: number): Promise<{ owners: IOwner[]; totalPages: number }>
    blockOwner(id: string): Promise<string | null>
    getWorkspaces(search: string, page: number, limit: number, status?:string): Promise<{ workspaces: IWorkspace[] | null; totalPages: number }>
    updateStatus(workspaceId: string, status: string): Promise<IWorkspace | undefined>
    workspaceDetails(workspaceId: string): Promise<IWorkspace|null>
}