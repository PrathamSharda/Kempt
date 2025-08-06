const jwt=require("jsonwebtoken");
const {Router}=require("express");
const signupRouter=Router();
const {userCredentials}=require("../../database/db.js");
const dotenv=require("dotenv");
const {z}=require("zod");
const bcrypt=require("bcrypt")
dotenv.config();

const jwt_secret=process.env.jwt_secret;

signupRouter.post("/",async (req,res,next)=>
{
    try{
    firstName=req.body.firstName;
    lastName=req.body.lastName;
    email=req.body.email;
    password=req.body.password;
    if(!firstName||!email||!password)throw {error:"cannot have a field empty"};
    const nameSchema=z.string().min(1).max(20);
    const lastNameSchema=z.string().min(0).max(20);
    const emailSchema=z.string().min(1).max(50).email();
    const passwordSchema=z.string().min(1).max(70).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~\s]{12,}$/,
    "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 12 characters long");
    const user=z.object({
        firstName:nameSchema,
        lastName:lastNameSchema,
        email:emailSchema,
        password:passwordSchema
    })
    const validation=user.safeParse({firstName,lastName,email,password});
    if(!validation.success)throw {error:validation.error,type:"regex"};

    const hashpassword= await bcrypt.hash(password,5);
    const userFinder=await userCredentials.findOne(
        {
            email
        }
    )
    if(userFinder)
    {
        throw {type:"user already exists",error:"user already is in the data try signin in"};
    }

    
    const newUser=await userCredentials.create({
        firstName,
        lastName,
        email,
        password:hashpassword,
    })
    const userId=await userCredentials.findOne({
        email
    })
    const token=jwt.sign({
        email,
        id:userId._id,
        firstName,
        lastName,
        token:userId.token,
        tokenResetTime:userId.tokenResetTime,
        premiumUser:userId.premiumUser
    },jwt_secret,
    {expiresIn:'7d'});

    // res.cookie("token",token,{
    //     httpOnly: true,
    //         secure:true,
    //         sameSite: 'none', 
    //         maxAge: 7 * 24 * 60 * 60 * 1000 
    // })
    res.redirect(`https://kempt.vercel.app/auth/callback?token=${encodeURIcomponent(token)}`);
    res.json({
        output:"this user is created"
    });
    }
    catch(error)
    {
        res.status(503).send(error);
    }
})



module.exports={
    signupRouter
}
