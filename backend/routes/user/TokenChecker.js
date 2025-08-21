const { success } = require("zod");
const { userCredentials } = require("../../database/db.js");

async function TokenReducer(email) {
    try {
       
        let user = await userCredentials.findOne({ email });
        if (!user) {
            throw {success:false, error: "user not found", type: "user_not_found" };
        }

        let totalToken = user.token;

        if (totalToken <= 0) {
            return { success: false, message: "No tokens available" };
        }

        totalToken = totalToken - 1;
      //  console.log(`Tokens remaining: ${totalToken}`);

        let updateData = { token: totalToken };
   
        if (totalToken === 0) {
            updateData.tokenResetTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
        }

        await userCredentials.updateOne(
            { email },
            { $set: updateData }
        );

        return { success: true, tokensRemaining: totalToken };

    } catch (error) {
        console.error('TokenReducer error:', error);
        return { success: false, error: error.message || error };
    }
}

async function TokenResetter(email) {
    try {

        let user = await userCredentials.findOne({ email });
         console.log
        if (!user) {
            throw { error: "user not found", type: "user_not_found" };
        }

        let totalToken = user.token;
        let tokenResetTime = new Date(user.tokenResetTime);
        
       // console.log(`Current tokens: ${totalToken}, Reset time: ${tokenResetTime}`);

        if (totalToken === 0 && tokenResetTime && new Date() >= tokenResetTime) {

            const newTokenCount = user.premiumUser ? 30 : 5; 
            
            await userCredentials.updateOne(
                { email },
                { 
                    $set: { 
                        token: newTokenCount,
                        tokenResetTime: null 
                    } 
                }
            );

            return { success: true, message: "Tokens reset successfully", newTokenCount };
        } else {
            return { 
                success: false, 
                message: "Token reset not available yet",
                resetTime: tokenResetTime 
            };
        }

    } catch (error) {
        console.error('TokenResetter error:', error);
        return { success: false, error: error.message || error };
    }
}

module.exports = {
    TokenReducer,
    TokenResetter,
   
};