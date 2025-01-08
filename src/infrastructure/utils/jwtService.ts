import jwt from "jsonwebtoken"
import jwtService, { tokenData } from "../../interface/Utils/jwtService"

export default class JwtToken implements jwtService {
    generateToken(data: tokenData): string {
        const secretKey = process.env.JWT_SECRET_KEY
        if(secretKey){
            const token = jwt.sign(data, secretKey)
            return token
        }
        throw new Error("Secret Key is Not Available")
    }
    generateRefreshToken(data: tokenData): string {
        const refreshTokenSecretKey = process.env.JWT_REFRESH_SECRET_KEY
        if(refreshTokenSecretKey){
            const refreshToken = jwt.sign(data, refreshTokenSecretKey)
            return refreshToken
        }
        throw new Error("refresh secret Key is Not Available")
    }
}