import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URL as string)
        console.log(`MongoDB connected : ${con.connection.host}`);

    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}
export default connectDB