    import bcrypt from "bcrypt"
    import IhashingService from "../../interface/Utils/hashingService"

    export default class HashingService implements IhashingService {
        async hashing(password: string){
            return await bcrypt.hash(password,10)
        }

        async compare(password: string, hashedPassword: string){
            try {
                return await bcrypt.compare(password, hashedPassword)
            } catch (error) {
                throw new Error("Failed to compare password")
            }
        }
    }