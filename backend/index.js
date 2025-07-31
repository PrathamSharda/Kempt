const express= require("express");
const cookieParser=require("cookie-parser");
const app=express();
const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();
const mongoID=process.env.mongoID;
const {authRouter}=require('./routes/auth/authRouter')
const cors=require("cors");


mongoose.connect(mongoID).then(()=>{
    console.log("sucesss")
    app.listen(3001,()=>{
    console.log("listening at port "+3001);
})
}).catch("error while connecting to mongodb");


app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth",authRouter)
app.use("/user",
()=>{
    
});

