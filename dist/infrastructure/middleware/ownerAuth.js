"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ownerSchema_1 = __importDefault(require("../model/ownerSchema"));
const ownerAuth = async (req, res, next) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.ownerToken;
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
        if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
            res.status(401).json({ message: 'Invalid token structure.' });
            return;
        }
        req.owner = decoded;
        if (typeof req.owner === 'object' && req.owner.userId) {
            const owner = await ownerSchema_1.default.findById(req.owner.userId);
            if (!owner) {
                res.status(404).json({ message: 'Owner not found.' });
                return;
            }
            if (!owner.isVerified) {
                res.status(403).json({ message: 'Owner not verified.' });
                return;
            }
            if (owner.isBlocked) {
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
exports.default = ownerAuth;
//# sourceMappingURL=ownerAuth.js.map