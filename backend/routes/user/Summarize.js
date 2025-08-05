const express=require("express");
const {Router}=require("express");
const summarizeRouter=Router();
const dotenv=require("dotenv");
const multer=require("multer")
const { Storage } = require("@google-cloud/storage");
const {summarizeDocument}=require("../../python/SummarizeCaller")

summarizeRouter.use(express.urlencoded({extended:false}));
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
const upload = multer({ storage: multer.memoryStorage() });




summarizeRouter.post("/",upload.array("files"),async (req,res,next)=>{
     try {

    const files=req.files;
    const prompt=req.body.prompt;
    if(files===null||files.length==0)
    {
            throw {error:"files are sent for excution ",type:"no file error"};
    }
   
    const promises = files.map(async (file) => {
        let fileName = file.destination + file.filename;
        const gcsFilePath = await uploadToGCS(file);
        return await summarizeDocument(gcsFilePath,prompt);
    });
    const results = await Promise.all(promises);
       const ans = results.map((parts)=>{
            return `\n\nSummary:${parts.summary} ${parts.keywords?("\n\nKeywords:"+parts.keywords):""}`
       })
     //  console.log(ans);
    res.json({
        message:ans
    }
    )
   // console.log("summarize")
  }catch (error) {
    console.log(error);
    res.status(500).json({ 
            error: "Internal server error", 
            details: error.error 
        });
  }

})


module.exports={
    summarizeRouter
}