import Iuser from "../../entities/userEntity"


export default interface IadminRepository {
    checkEmailExists(email: string): Promise<Iuser | null>
    getAllUsers(search: string, page: number, limit: number): Promise<{ users: Iuser[]; totalCount: number }>
    blockOrUnBlockUser(id: string): Promise<Iuser | null>
}