import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import path from "path";
import userRouter from '../routes/userRoutes';
import adminRouter from '../routes/adminRoutes';
import ownerRouter from "../routes/ownerRoutes";
import cron from 'node-cron';
import { SubscriptionService } from "../utils/subscriptionService";

const app = express()
dotenv.config()

const logDirPath = path.join(__dirname, '../config/logs');

if (!fs.existsSync(logDirPath)) {
    fs.mkdirSync(logDirPath, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
    path.join(logDirPath, '/access.log'),
    { flags: "a" }
);
app.use(morgan("dev"))
app.use(morgan("combined", { stream: accessLogStream }));

cron.schedule('0 0 * * *', async () => {
    console.log('Running subscription expiration check...');
    const subscriptionService = new SubscriptionService();
    await subscriptionService.checkExpiredSubscriptions();
});

app.use(cookieParser())
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ extended: true, limit: "100mb" }))
app.use(
    cors({
        origin: "https://find-adesk-frontend.vercel.app",
        credentials: true
    })
);

//Routes 
app.use('/api', userRouter)
app.use('/admin', adminRouter)
app.use('/owner', ownerRouter)

export default app