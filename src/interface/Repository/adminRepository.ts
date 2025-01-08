import Iuser from "../../entities/userEntity"


export default interface IadminRepository {
    checkEmailExists(email: string): Promise<Iuser | null>
    getAllUsers(): Promise<Iuser[]>
}