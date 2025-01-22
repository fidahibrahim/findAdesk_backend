import {createServer} from 'http'
import app from "./infrastructure/config/app"
import connectDB from "./infrastructure/config/db"


const PORT = process.env.PORT
const httpServer = createServer(app)

connectDB()

httpServer.listen(PORT,()=>{
    console.log(`server running on http://localhost:${PORT}`);
})
