const {Router}=require("express");
const {signinRouter}=require("./signin")
const {signupRouter}=require("./signup")
const {oauthRouter}=require("./oauth")
const {isValid}=require("./isValid")
const authRouter=Router();

authRouter.use("/signup",signupRouter);
authRouter.use("/signin",signinRouter);
authRouter.use("/LoginWithGoogle",oauthRouter);
authRouter.use("/isValid",isValid);
module.exports={
    authRouter
}