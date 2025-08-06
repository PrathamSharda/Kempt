const express=require("express");
const {Router}=require("express");
const userRouter=Router();
const dotenv=require("dotenv");
const multer= require("multer")
const {featureExtractRouter}=require("./extractFeature");
const {qandaRouter} =require("./QuestionAnswer")
const {summarizeRouter}=require("./Summarize")
const jwt=require("jsonwebtoken")
const jwt_secret=process.env.jwt_secret;
const{ TokenReducer,TokenResetter}=require("./TokenChecker")



userRouter.use("/",async (req,res,next)=>{
    try{
    const Token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    const user=jwt.decode(Token);
    const email=user.email;
    const val2=await TokenResetter(email);
    const value=await TokenReducer(email);
     if(!value.success)
    {

        throw {error:"out of token please try later"};
    }
    
    req.email=email;
    next();
    }
    catch(error)
    {
        console.log(error);
        res.status(400).json({
            error
        })
    }
})
userRouter.use("/qa",qandaRouter);
userRouter.use("/fix",featureExtractRouter);
userRouter.use("/summarize",summarizeRouter);
module.exports={
    userRouter
}
