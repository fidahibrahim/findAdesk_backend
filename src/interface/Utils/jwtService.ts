
export interface tokenData {
    userId: string,
    name: string,
    iat?: number
}



export default interface IjwtService {
    generateToken(data: tokenData): string
    generateRefreshToken(data: tokenData): string
}