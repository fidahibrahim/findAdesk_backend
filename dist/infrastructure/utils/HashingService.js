"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
class HashingService {
    async hashing(password) {
        return await bcrypt_1.default.hash(password, 10);
    }
    async compare(password, hashedPassword) {
        try {
            return await bcrypt_1.default.compare(password, hashedPassword);
        }
        catch (error) {
            throw new Error("Failed to compare password");
        }
    }
}
exports.default = HashingService;
//# sourceMappingURL=HashingService.js.map