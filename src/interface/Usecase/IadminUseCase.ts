import Iuser from "../../entities/userEntity"

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
}