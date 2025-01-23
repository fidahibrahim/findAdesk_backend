import sharp from "sharp";
import crypto from "crypto"


export async function sharpImage(
  width: number,
  height: number,
  buffer: Buffer
): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize({ width, height, fit: "fill" })
      .toBuffer();
  } catch (error) {
    console.error("Error during image processing:", error);
    throw new Error("Image processing failed.");
  }
}

export const randomImageName = (bytes = 32)=> crypto.randomBytes(bytes).toString("hex")
  
