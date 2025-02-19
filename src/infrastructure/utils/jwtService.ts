import jwt from "jsonwebtoken"
import jwtService, { DecodedJwt, tokenData } from "../../interface/Utils/jwtService"

export default class JwtToken implements jwtService {
    generateToken(data: tokenData): string {
        const secretKey = process.env.JWT_SECRET_KEY
        if (secretKey) {
            const token = jwt.sign(data, secretKey)
            return token
        }
        throw new Error("Secret Key is Not Available")
    }
    generateRefreshToken(data: tokenData): string {
        const refreshTokenSecretKey = process.env.JWT_REFRESH_SECRET_KEY
        if (refreshTokenSecretKey) {
            const refreshToken = jwt.sign(data, refreshTokenSecretKey)
            return refreshToken
        }
        throw new Error("refresh secret Key is Not Available")
    }
    verifyToken(token: string): DecodedJwt | null {
        try {
            let secretKey = process.env.JWT_SECRET_KEY
            let decoded = jwt.verify(token, secretKey!) as DecodedJwt
            console.log("Decoded JWT:", decoded); 
            return decoded
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return null
            } else {
                throw new Error("JWT verification Error")
            }
        }
    }
    verifyRefreshToken(token: string) {
        try {
            let refreshSecretKey = process.env.JWT_REFRESH_SECRET_KEY
            if (refreshSecretKey) {
                let decoded = jwt.verify(token, refreshSecretKey!) as DecodedJwt
                return decoded
            }
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return null
            } else {
                throw new Error("JWT verification Error")
            }
        }
    }
    generateTokenForgot(data: tokenData, expireTime: string): string {
        let secretKey = process.env.JWT_SECRET_KEY
        if(secretKey){
            let token = jwt.sign(data, secretKey, {expiresIn: expireTime})
            return token
        }
        throw new Error("Secret Key is Not Available")
    }
}   