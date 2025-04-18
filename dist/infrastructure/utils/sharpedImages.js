"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomImageName = void 0;
exports.sharpImage = sharpImage;
const sharp_1 = __importDefault(require("sharp"));
const crypto_1 = __importDefault(require("crypto"));
async function sharpImage(width, height, buffer) {
    try {
        return await (0, sharp_1.default)(buffer)
            .resize({ width, height, fit: "fill" })
            .toBuffer();
    }
    catch (error) {
        console.error("Error during image processing:", error);
        throw new Error("Image processing failed.");
    }
}
const randomImageName = (bytes = 32) => crypto_1.default.randomBytes(bytes).toString("hex");
exports.randomImageName = randomImageName;
//# sourceMappingURL=sharpedImages.js.map