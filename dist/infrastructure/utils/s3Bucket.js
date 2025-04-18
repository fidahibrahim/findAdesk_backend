"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendObjectToS3 = sendObjectToS3;
exports.createImageUrl = createImageUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_ACCESS_KEY;
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
    },
    region: bucketRegion,
});
async function sendObjectToS3(name, type, buffer, sharpedImage) {
    const params = {
        Bucket: bucketName,
        Key: name,
        Body: buffer,
        ContentType: type,
    };
    const comand = new client_s3_1.PutObjectCommand(params);
    await s3.send(comand);
    return "added succesfully";
}
async function createImageUrl(image) {
    return `https://${bucketName}.s3.amazonaws.com/${image}`;
}
//# sourceMappingURL=s3Bucket.js.map