const express= require("express");
const cookieParser=require("cookie-parser");
const app=express();
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const {authRouter}=require('./routes/auth/authRouter')
const cors=require("cors");
const {userRouter} =require("./routes/user/userRouter")
const { rateLimit } =require('express-rate-limit')

dotenv.config();
const mongoID=process.env.mongoID;
const PORT=process.env.PORT||8080;


mongoose.connect(mongoID).then(()=>{
    console.log("sucesss")
    app.listen(PORT,()=>{
    console.log("listening at port "+PORT);
})
}).catch("error while connecting to mongodb");



const limiter = rateLimit({
	windowMs: 3 * 60 * 1000, 
	limit: 40, 
	standardHeaders: 'draft-8', 
	legacyHeaders: true,
	ipv6Subnet: 56
})

app.use(limiter)
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth",authRouter)
app.use("/user",userRouter);
