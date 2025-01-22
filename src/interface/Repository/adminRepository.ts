import IOwner from "../../entities/ownerEntity";
import Iuser from "../../entities/userEntity"


export default interface IadminRepository {
    checkEmailExists(email: string): Promise<Iuser | null>
    checkUserExists(id: string): Promise<Iuser | null>
    getAllUsers(search: string, page: number, limit: number): Promise<{ users: Iuser[]; totalCount: number }>
    blockOrUnBlockUser(id: string): Promise<Iuser | null>
    getAllOwners(search: string, page: number, limit: number): Promise<{ owners: IOwner[]; totalCount: number }> 
    blockOrUnBlockOwner(id: string): Promise<IOwner | null>   
}