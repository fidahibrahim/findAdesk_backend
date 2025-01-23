import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ownerModel from "../model/ownerSchema";

interface OwnerPayload extends JwtPayload {
    userId: string;
}

export interface AuthenticatedRequest extends Request {
    owner?: OwnerPayload;
}

const ownerAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.ownerToken
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const secretKey = process.env.JWT_SECRET_KEY
    if(!secretKey){
        console.error('JWT_SECRET_KEY is not defined in environment variables.');
        res.status(500).json({ message: 'Internal server error.' });
        return;
    }
    try {
        const decoded = jwt.verify(token, secretKey) as OwnerPayload;

        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token structure.' });
            return;
        }

        req.owner = decoded;
        
        if(typeof req.owner === 'object' && req.owner.userId) {
            const owner = await ownerModel.findById(req.owner.userId);
            if(!owner){
                res.status(404).json({ message:'Owner not found.' })
                return
            }
            if(!owner.isVerified) {
                res.status(403).json({ message: 'Owner not verified.' });
                return;
            }
            if(owner.isBlocked){
                res.status(403).json({ message: 'You have been blocked' });
                return;
            }
            next()
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
}

export default ownerAuth