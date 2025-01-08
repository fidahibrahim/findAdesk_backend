"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtToken {
    generateToken(data) {
        const secretKey = process.env.JWT_SECRET_KEY;
        if (secretKey) {
            const token = jsonwebtoken_1.default.sign(data, secretKey);
            return token;
        }
        throw new Error("Secret Key is Not Available");
    }
    generateRefreshToken(data) {
        const refreshTokenSecretKey = process.env.JWT_REFRESH_SECRET_KEY;
        if (refreshTokenSecretKey) {
            const refreshToken = jsonwebtoken_1.default.sign(data, refreshTokenSecretKey);
            return refreshToken;
        }
        throw new Error("refresh secret Key is Not Available");
    }
}
exports.default = JwtToken;
//# sourceMappingURL=jwtService.js.map