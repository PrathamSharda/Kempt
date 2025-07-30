const mongoose=require("mongoose");
const schema=mongoose.Schema;
const objectId=mongoose.objectId;


const credentials = new schema({
  firstName: { type: String, required: true },
  lastName: { type: String},
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      return !this.isGoogleUser;
    }
  },
  isGoogleUser: { type: Boolean, default: false },
  premiumUser: { type: Boolean, required: true, default: false }
});
const userCredentials=mongoose.model("credentials",credentials);


module.exports={
    userCredentials
}
