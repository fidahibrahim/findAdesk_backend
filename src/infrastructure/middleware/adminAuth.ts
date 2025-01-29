import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import userModel from '../model/userSchema';

interface AuthenticatedRequest extends Request {
    admin?: JwtPayload | string;
}

const adminAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.adminToken;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const secretKey = process.env.JWT_SECRET_KEY
    if (!secretKey) {
        console.error('JWT_SECRET_KEY is not defined in environment variables.');
        res.status(500).json({ message: 'Internal server error.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.admin = decoded;

        if (typeof req.admin === 'object' && req.admin.userId) {
            const admin = await userModel.findById(req.admin.userId);
            if (!admin) {
                res.status(404).json({ message: 'Admin not found.' });
                return;
            }

            if (!admin.isVerified) {
                res.status(403).json({ message: 'Admin not verified.' });
                return;
            }

            next();
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export default adminAuth;