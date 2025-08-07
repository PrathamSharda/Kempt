const express=require("express");
const {Router}=require("express");
const featureExtractRouter=Router();
const dotenv=require("dotenv");
const multer=require("multer")
const fs=require("fs");
const { Storage } = require("@google-cloud/storage");
const {PythonFileCaller}=require("../../python/OCRcaller")
const path=require("path");

featureExtractRouter.use(express.urlencoded({extended:false}));
const gcs = new Storage();



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

const storage =multer.diskStorage({
  destination: function (req,file,cb)
  {
     const absolutePath = path.resolve(__dirname, '../../python/FileStorage/');
    fs.mkdirSync(absolutePath, { recursive: true });
    return cb(null,absolutePath)
  },
  filename:function (req,file,cb)
  {
    return cb(null,`${Date.now()}-${file.originalname}`);
  }
})
const upload=multer({storage:storage})
featureExtractRouter.post("/",upload.array("files"),async (req,res,next)=>{
     try {
        let ans="";
        const files=req.files;
      //  console.log(files);
        if(files===null||files.length==0 )
        {
            throw {error:"files are sent for excution ",type:"no file error"};
            
        }
        const promises = files.map(async (file) => {
            let fileName = path.join(file.destination , file.filename);
            console.log(fileName);
            return await PythonFileCaller(fileName, 'fix');
        });

      const results = await Promise.all(promises);
      //cleanup
      const cleanupPromise = files.map(async (file) => {
            let fileName = path.join(file.destination , file.filename);
            //console.log(fileName);
            return await fs.unlink(fileName,(err) => {
            if (err) {
            throw err;
            } else {
              //console.log('File deleted successfully');
            }
            });
          });
        const cleanup=await Promise.all(cleanupPromise);

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