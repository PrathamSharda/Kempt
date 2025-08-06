const jwt=require("jsonwebtoken");
const {Router}=require("express");
const oauthRouter=Router();
const {userCredentials}=require("../../database/db.js");
const dotenv=require("dotenv");
const {z}=require("zod");
const axios=require("axios");
const crypto=require("crypto");
const { createClient } =require('redis');



dotenv.config();

const jwt_secret=process.env.jwt_secret;
const redis_password=process.env.REDIS_PASSWORD;
const redis_port=process.env.REDIS_PORT;
const redis_host=process.env.REDIS_HOST;

//connection to redis
const client = createClient({
    username: 'default',
    password:redis_password ,
    socket: {
        host:redis_host,
        port: redis_port
    }
});

client.on('error', err => console.log('Redis Client Error', err));
client.on("connect",()=>{
    console.log("connected");
})


oauthRouter.get("/",async (req,res,next)=>
{
    try{
    if (!client.isOpen) {
    await client.connect();
}
    const state=  crypto.randomBytes(32).toString('hex');
    const redirectURL="https://kempt-1017350567380.europe-west1.run.app/auth/LoginWithGoogle/callback";
    const ClientId=process.env.CLIENT_ID;

    const url=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${ClientId}&redirect_uri=${redirectURL}&response_type=code&scope=email profile&access_type=offline&prompt=consent&state=${state}`;

    await client.setEx(state,3*60,JSON.stringify({used:false}));
   

    res.redirect(url);
    }catch(error)
    {
        console.log(error);
        res.status(400).send("cannot connect to backend securely...try again");
    }
})

oauthRouter.get("/callback",async (req,res,next)=>
{
    const code=req.query.code;
    const state=req.query.state;
   
    const redirectURL="https://kempt-1017350567380.europe-west1.run.app/auth/LoginWithGoogle/callback";
    try{
        const codeSchema=z.string().min(1);
        const stateSchema=z.string().min(1);
        const inputObject=z.object({
            code:codeSchema,
            state:stateSchema
        })
        const inputValidation=inputObject.safeParse({
            code,
            state
        })
        if(!inputValidation.success)throw{error:"input validation failed",type:"CSRF attack"};

        const result = await client.get(state);
        const storedStateData=JSON.parse(result);
        if (!storedStateData) {
            throw{error:"no stored state",type:"CSRF attack"};
        }
        
         await client.del(state);
        

        const tokenRes=await axios.post('https://oauth2.googleapis.com/token',{
            client_id:process.env.CLIENT_ID,
            client_secret:process.env.CLIENT_SECRET,
            code,
            redirect_uri:redirectURL,
            grant_type:"authorization_code"
        })
        const acessToken=tokenRes.data.access_token;

        const profileRes=await axios.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers:
                {
                    Authorization:`Bearer${acessToken}`
                }
            }
        );
        const fullName = profileRes.data.name;
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || ''; 

        const googleUser = {
            firstName: firstName,
            lastName: lastName,
            email: profileRes.data.email,
            
        };
        // console.log(googleUser);
        let user = await userCredentials.findOne({ email: googleUser.email });
        if (!user) {
            user = await userCredentials.create({
                firstName: googleUser.firstName,
                lastName: googleUser.lastName,
                email: googleUser.email,
                isGoogleUser: true,
                password: null 
            });
           
        }else{
            user=await userCredentials.updateOne(
                    { email: googleUser.email },
                    { $set: { isGoogleUser: true, password: null } }
                
            )
        }
        user=await userCredentials.findOne({
                email:googleUser.email
            })

        const yourJWT = jwt.sign(
            { 
                id: user._id, 
                firstName:googleUser.firstName,
                lastName:googleUser.lastName,
                email:googleUser.email,
                token:user.token,
                tokenResetTime:user.tokenResetTime,
                premiumUser:user.premiumUser
            },
            jwt_secret,
            { expiresIn: '7d' }
        );

        res.cookie('token', yourJWT, {
            httpOnly: true,
            secure:true,
            sameSite: 'strict', 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

    //   //  console.log("google user",
    //        { 
    //             id: user._id, 
    //             email: user.email,
    //             firstName:googleUser.firstName,
    //             lastName:googleUser.lastName
    //         }
    // )
    res.redirect("https://kempt.vercel.app/home");
    }
    catch(error)
    {
        res.status(404).send(`auth failed ${error.error}`);
    }
})



module.exports={
    oauthRouter
}
