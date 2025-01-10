import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from '../routes/userRoutes'
import adminRouter from '../routes/adminRoutes'
import ownerRouter from "../routes/ownerRoutes";


const app = express()
dotenv.config()

app.use(cookieParser())

app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ extended: true, limit: "100mb" }))

app.use(
    cors({
        origin: "http://localhost:5000",
        credentials: true
    })
);

//Routes 
app.use('/api', userRouter)
app.use('/admin', adminRouter)
app.use('/owner', ownerRouter)

export default app