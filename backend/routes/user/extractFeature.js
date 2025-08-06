const express=require("express");
const {Router}=require("express");
const featureExtractRouter=Router();
const dotenv=require("dotenv");
const multer=require("multer")
const { Storage } = require("@google-cloud/storage");
const {PythonFileCaller}=require("../../python/OCRcaller")


featureExtractRouter.use(express.urlencoded({extended:false}));
const gcs = new Storage();

const bucket = gcs.bucket("kemptstorage");
const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      const gcsPath = `gs://kemptstorage/${fileName}`;
      resolve(gcsPath);
    });

    blobStream.end(file.buffer);
  });
};

const generateSignedUrl = async (gcsPath) => {
  try {
    const bucketName = gcsPath.replace("gs://", "").split("/")[0];
    const fileName = gcsPath.replace(`gs://${bucketName}/`, "");
    const [url] = await gcs.bucket(bucketName).file(fileName).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
    });
    return url;
  } catch (error) {
    
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

const upload = multer({ storage: multer.memoryStorage() });

featureExtractRouter.post("/",upload.array("files"),async (req,res,next)=>{
     try {
        let ans="";
        const files=req.files;
        if(files===null||files.length==0 )
        {
            throw {error:"files are sent for excution ",type:"no file error"};
            
        }
        const promises = files.map(async (file) => {
            let fileName = file.destination + file.filename;
            const gcsFilePath = await uploadToGCS(file);
            return await PythonFileCaller(gcsFilePath, 'fix');
        });

      const results = await Promise.all(promises);
       ans = results.join(',');

       let array=ans.split(",");

       const promisesURL = array.map(async (fileUrl) => {
        const realFileurl = fileUrl.replace("\n", "");
        const finalURL = await generateSignedUrl(realFileurl); 
        return finalURL; 
      });
    const returnArray = await Promise.all(promisesURL);

      // console.log(returnArray);
      // console.log("done");
      // console.log("fix")
        res.json({
            message:returnArray
        })

      }catch (error) {
        console.log(error);
        res.status(400).json({error:error});
      }

})



module.exports = {
    featureExtractRouter
};