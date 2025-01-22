
export interface tokenData {
    userId: string;
    name: string;
    role: string;
    iat?: number;
}

export interface DecodedJwt {
    userId: string;
    role: string;
    name?: string;
    iat: number;
    exp?: number;
}

export default interface IjwtService {
    generateToken(data: tokenData): string
    generateRefreshToken(data: tokenData): string
    verifyToken(token: string): DecodedJwt | null
    generateTokenForgot(data: tokenData, expireTime: string): string
}