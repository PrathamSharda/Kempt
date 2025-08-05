const jwt=require("jsonwebtoken");
const {Router}=require("express");
const signinRouter=Router();
const {userCredentials}=require("../../database/db.js");
const dotenv=require("dotenv");
const {z}=require("zod");
const bcrypt=require("bcrypt")
dotenv.config();

const jwt_secret=process.env.jwt_secret;

function tokenVerification(token)
{   
    if(token===undefined) return false;
    return jwt.verify(token,jwt_secret);
    
}

signinRouter.post("/",async (req,res,next)=>
{
    try{
    const token=req.cookies.token;
    if(token!==undefined)
    {
        if(tokenVerification(token))
        {
            const userDetails=jwt.decode(token);
            const findingUser=await userCredentials.findOne({
                _id:userDetails.id
            })
            if(findingUser)
            {
            res.send("login sucessfull");
            return;
            }else{
                throw {error:"user does not exist in database", type:"user missing"};
            }
        }
    }
    const email=req.body.email;
    const password=req.body.password;

    const emailSechma=z.string().min(1).max(50).email();
    const passwordSchema=z.string().min(1).max(70).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~\s]{12,}$/,
    "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 12 characters long");
    
    const userValidationObject=z.object({
        email:emailSechma,
        password:passwordSchema
    }) 

    const verifyingInput=userValidationObject.safeParse({email,password});

    if(!verifyingInput)
    {
        throw {error:verifyingInput.error,type:"regex"}
    }

    

    const findingUser=await userCredentials.findOne({
                email
    });

    if(!findingUser)
    {
        throw {error:"user does not exist in database", type:"user missing"};
    }

    if(findingUser.isGoogleUser)
        throw {error:"the user has signed in using google try that", type:"google signin"};


    const hashedPassword= await bcrypt.compare(password,findingUser.password);
    if(!hashedPassword)
    {
        throw {error:"password provided is wrong", type:"wrong password"};
    }
    const userToken=jwt.sign({
        id:findingUser._id,
        firstName:findingUser.firstName,
        lastName:findingUser.lastName,
        email:findingUser.email,
        token:findingUser.token,
        tokenResetTime:findingUser.tokenResetTime,
        premiumUser:findingUser.premiumUser
    },jwt_secret,
    {expiresIn:'7d'});

    res.cookie("token",userToken,{
        httpOnly: true,
        secure:true,
        sameSite:'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({
        output:"user logged in sucessfully"
    })
    }
    catch(error)
    {
        res.status(503).send(error);
    }
})



module.exports={
    signinRouter
}
