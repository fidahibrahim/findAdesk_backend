"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema_1 = __importDefault(require("../model/userSchema"));
const adminAuth = async (req, res, next) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.adminToken;
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
        req.admin = decoded;
        if (typeof req.admin === 'object' && req.admin.userId) {
            const admin = await userSchema_1.default.findById(req.admin.userId);
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
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
exports.default = adminAuth;
//# sourceMappingURL=adminAuth.js.map