import { NextFunction, Request, Response } from "express";
import adminRepository from "../../adapters/repository/adminRepository";
import ownerModel from "../model/ownerSchema";
import userModel from "../model/userSchema";
import JwtToken from "../utils/jwtService";
import { JwtPayload } from "jsonwebtoken";

const jwtService = new JwtToken
const adminRepo = new adminRepository(userModel, userModel, ownerModel)

interface IAuthRequest extends Request {
    userId?: JwtPayload | string
}

const adminAuth = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.adminRefreshToken
    let adminToken = req.cookies.adminToken

    if (!refreshToken) {
        res.status(401).json({ message: "Not authorized, no refresh token" });
        return
    }

    if (!adminToken || adminToken === '' || Object.keys(adminToken).length === 0) {
        try {
            const newUserToken = await refreshAccessToken(refreshToken)
            res.cookie("adminToken", newUserToken, {
                httpOnly: true,
                maxAge: 3600000
            })
            adminToken = newUserToken
        } catch (error) {
            res.status(401).json({ message: "Failed to refresh access token" });
            return
        }
    }

    try {
        const decoded = jwtService.verifyToken(adminToken)
        let user
        if (decoded) {
            user = await adminRepo.checkUserExists(decoded.userId)
        }

        if (!user) {
            res.status(401).json({ message: "Admin not found" });
            return
        }

        if (decoded?.role != 'admin') {
            res.status(401).json({ message: "Not authorized, invalid role" });
            return
        }
        next()
    } catch (error) {
        res.status(401).json({ message: "Not authorized, invalid token" });
        return
    }
}

async function refreshAccessToken(refreshToken: string) {
    try {
        const decoded = await jwtService.verifyRefreshToken(refreshToken)
        if (decoded && decoded.name) {
            const newToken = await jwtService.generateToken({ userId: decoded?.userId, name: decoded?.name, role: decoded?.role })
            return newToken
        }
    } catch (error) {
        throw new Error("Invalid refresh token")
    }
}

export default adminAuth