import { S3Client , PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'

dotenv.config()

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretKey = process.env.SECRET_ACCESS_KEY


const s3 = new S3Client({
  credentials :{
    accessKeyId : accessKey as string,
    secretAccessKey : secretKey as string
  },
  region:bucketRegion,
})

export async function sendObjectToS3(name:string,type:string,buffer:Buffer){  
  const params = {
    Bucket : bucketName,
    Key : name,
    Body : buffer,
    ContentType : type
  }
  const comand = new PutObjectCommand(params)
  await s3.send(comand)
  return "added succesfully"
}

export async function createImageUrl(image:string){
  return `https://${bucketName}.s3.amazonaws.com/${image}`
}