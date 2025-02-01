import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import userModel from '../model/userSchema';

interface UserPayload extends JwtPayload {
    userId: string;
}
export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}

const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies?.userToken;
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
        const decoded = jwt.verify(token, secretKey) as UserPayload;
        req.user = decoded;

        if (typeof req.user === 'object' && req.user.userId) {
            const user = await userModel.findById(req.user.userId);
            if (!user) {
                res.status(404).json({ message: 'User not found.' });
                return;
            }

            if (!user.isVerified) {
                res.status(403).json({ message: 'User not verified.' });
                return;
            }

            if (user.isBlocked) {
                res.status(403).json({ message: 'You have been blocked' });
                return;
            }
            next();
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export default authenticateUser;