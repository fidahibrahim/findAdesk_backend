"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema_1 = __importDefault(require("../model/userSchema"));
const authenticateUser = async (req, res, next) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.userToken;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        console.error('JWT_SECRET_KEY is not defined in environment variables.');
        res.status(500).json({ message: 'Internal server error.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        req.user = decoded;
        if (typeof req.user === 'object' && req.user.userId) {
            const user = await userSchema_1.default.findById(req.user.userId);
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
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
exports.default = authenticateUser;
//# sourceMappingURL=userAuth.js.map