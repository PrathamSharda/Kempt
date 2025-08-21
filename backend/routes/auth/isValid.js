const {Router}=require("express");
const isValid=Router();
const jwt=require("jsonwebtoken");
const dotenv=require("dotenv");
const {userCredentials}=require("../../database/db.js");
const { TokenReducer,TokenResetter}=require("../user/TokenChecker.js")
dotenv.config();

const jwt_secret=process.env.jwt_secret;
isValid.use("/",async (req,res,next)=>{
    try{
    const Token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    const user=jwt.decode(Token);
    const email=user.email;
    const val2=await TokenResetter(email);
    const value=await TokenReducer(email);
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
});
isValid.get("/",async (req,res,next)=>{
    try{
        const allowedOrigins = ['https://kempt.vercel.app', 'http://localhost:5173'];
        const origin = req.headers.origin;
        
        if (!allowedOrigins.includes(origin)) {
        throw {error: "Unauthorized origin", type: "security violation"};
        }
        const token=req.cookies.token|| req.headers.authorization?.split(' ')[1];
        if(token==undefined){
            throw {error:"token not found",type:"login failed"};
        }
        const verificationOfToken=jwt.verify(token,jwt_secret);
        if(!verificationOfToken)
        {
            throw {error:"token has invalid signature",type:"login failed"};
        }
        const decodeToken=jwt.decode(token);

        // console.log("token",decodeToken);
        const gettingUser = await userCredentials.findOne({
            _id: decodeToken.id
        });

        if (!gettingUser) {
            throw { error: "token pointing to the user doesn't exist", type: "login failed" };
        }
        

         res.json({
            firstName:gettingUser.firstName,
            lastName:gettingUser.lastName,
            email:gettingUser.email,
            token:gettingUser.token,
            tokenResetTime:gettingUser.tokenResetTime,
            premiumUser:gettingUser.premiumUser
        });
    }
    catch(error)
    {
        res.status(400).send(error);
    }
});

module.exports={
    isValid
}