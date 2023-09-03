import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./Router/user.js"
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

const app=express()

app.listen(3001,()=>{
    console.log("Server running...");
})

app.use(cookieParser())
app.use(express.json());
app.use(cors({
    origin: [process.env.origin],
    methods: ["GET", "POST"],
    credentials: true
}))

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB Connected Succesfull!");
}).catch((error) => {
    console.log(error.message)
})

app.use('/',userRouter)