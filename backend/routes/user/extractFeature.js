// const express=require("express");
// const {Router}=require("express");
// const featureExtractRouter=Router();
// const dotenv=require("dotenv");
// const multer=require("multer")
// const { Storage } = require("@google-cloud/storage");
// const {PythonFileCaller}=require("../../python/OCRcaller")


// featureExtractRouter.use(express.urlencoded({extended:false}));
// const gcs = new Storage();

// const bucket = gcs.bucket("kemptstorage");
// const uploadToGCS = (file) => {
//   return new Promise((resolve, reject) => {
//     const fileName = `${Date.now()}_${file.originalname}`;
//     const blob = bucket.file(fileName);
//     const blobStream = blob.createWriteStream({
//       resumable: false,
//     });

//     blobStream.on("error", (err) => {
//       reject(err);
//     });

//     blobStream.on("finish", () => {
//       const gcsPath = `gs://kemptstorage/${fileName}`;
//       resolve(gcsPath);
//     });

//     blobStream.end(file.buffer);
//   });
// };

// const generateSignedUrl = async (gcsPath) => {
//   try {
//     const bucketName = gcsPath.replace("gs://", "").split("/")[0];
//     const fileName = gcsPath.replace(`gs://${bucketName}/`, "");
//     const [url] = await gcs.bucket(bucketName).file(fileName).getSignedUrl({
//       version: 'v4',
//       action: 'read',
//       expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
//     });
//     return url;
//   } catch (error) {
    
//     console.error("Error generating signed URL:", error);
//     throw error;
//   }
// };

// const upload = multer({ storage: multer.memoryStorage() });

// featureExtractRouter.post("/",upload.array("files"),async (req,res,next)=>{
//      try {
//         let ans="";
//         const files=req.files;
//         if(files===null||files.length==0 )
//         {
//             throw {error:"files are sent for excution ",type:"no file error"};
            
//         }
//         const promises = files.map(async (file) => {
//             let fileName = file.destination + file.filename;
//             const gcsFilePath = await uploadToGCS(file);
//             return await PythonFileCaller(gcsFilePath, 'fix');
//         });

//       const results = await Promise.all(promises);
//        ans = results.join(',');

//        let array=ans.split(",");

//        const promisesURL = array.map(async (fileUrl) => {
//         const realFileurl = fileUrl.replace("\n", "");
//         const finalURL = await generateSignedUrl(realFileurl); 
//         return finalURL; 
//       });
//     const returnArray = await Promise.all(promisesURL);

//       // console.log(returnArray);
//       // console.log("done");
//       // console.log("fix")
//         res.json({
//             message:returnArray
//         })

//       }catch (error) {
//         console.log(error);
//         res.status(400).json(error);
//       }

// })

// module.exports={
//     featureExtractRouter
// }

const express = require("express");
const { Router } = require("express");
const featureExtractRouter = Router();
const dotenv = require("dotenv");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const { PythonFileCaller } = require("../../python/OCRcaller");

featureExtractRouter.use(express.urlencoded({ extended: false }));

const gcs = new Storage();
const bucket = gcs.bucket("kemptstorage");

const uploadToGCS = (file) => {
    return new Promise((resolve, reject) => {
        console.log(`[uploadToGCS] Starting upload for file: ${file.originalname} (${file.size} bytes)`);
        
        const fileName = `${Date.now()}_${file.originalname}`;
        console.log(`[uploadToGCS] Generated fileName: ${fileName}`);
        
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });
        
        blobStream.on("error", (err) => {
            console.error(`[uploadToGCS] Upload error for ${fileName}:`, err);
            reject(err);
        });
        
        blobStream.on("finish", () => {
            const gcsPath = `gs://kemptstorage/${fileName}`;
            console.log(`[uploadToGCS] Upload completed successfully: ${gcsPath}`);
            resolve(gcsPath);
        });
        
        console.log(`[uploadToGCS] Starting blob stream for ${fileName}`);
        blobStream.end(file.buffer);
    });
};

const generateSignedUrl = async (gcsPath) => {
    try {
        console.log(`[generateSignedUrl] Generating signed URL for: ${gcsPath}`);
        
        const bucketName = gcsPath.replace("gs://", "").split("/")[0];
        const fileName = gcsPath.replace(`gs://${bucketName}/`, "");
        
        console.log(`[generateSignedUrl] Bucket: ${bucketName}, File: ${fileName}`);
        
        const [url] = await gcs.bucket(bucketName).file(fileName).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
        });
        
        console.log(`[generateSignedUrl] Generated URL: ${url.substring(0, 100)}...`);
        return url;
    } catch (error) {
        console.error("[generateSignedUrl] Error generating signed URL:", error);
        throw error;
    }
};

const upload = multer({ storage: multer.memoryStorage() });

featureExtractRouter.post("/", upload.array("files"), async (req, res, next) => {
    console.log(`[POST /] Request received at ${new Date().toISOString()}`);
    
    try {
        let ans = "";
        const files = req.files;
        
        console.log(`[POST /] Number of files received: ${files ? files.length : 0}`);
        
        if (files === null || files.length == 0) {
            console.log("[POST /] No files provided in request");
            throw { error: "files are sent for execution", type: "no file error" };
        }

        // Log file details
        files.forEach((file, index) => {
            console.log(`[POST /] File ${index + 1}: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
        });

        console.log("[POST /] Starting parallel file uploads to GCS");
        const promises = files.map(async (file, index) => {
            console.log(`[POST /] Processing file ${index + 1}/${files.length}: ${file.originalname}`);
            
            let fileName = file.destination + file.filename;
            console.log(`[POST /] Local fileName for file ${index + 1}: ${fileName}`);
            
            const gcsFilePath = await uploadToGCS(file);
            console.log(`[POST /] File ${index + 1} uploaded to GCS: ${gcsFilePath}`);
            
            console.log(`[POST /] Starting OCR processing for file ${index + 1}`);
            const ocrResult = await PythonFileCaller(gcsFilePath, 'fix');
            console.log(`[POST /] OCR completed for file ${index + 1}. Result length: ${ocrResult ? ocrResult.length : 0} chars`);
            
            return ocrResult;
        });

        console.log("[POST /] Waiting for all OCR processes to complete");
        const results = await Promise.all(promises);
        console.log(`[POST /] All OCR processes completed. Results count: ${results.length}`);
        
        ans = results.join(',');
        console.log(`[POST /] Combined results length: ${ans.length} chars`);
        
        let array = ans.split(",");
        console.log(`[POST /] Split results into ${array.length} items`);
        
        // Log each result path
        array.forEach((item, index) => {
            console.log(`[POST /] Result ${index + 1}: ${item.trim().substring(0, 100)}${item.trim().length > 100 ? '...' : ''}`);
        });

        console.log("[POST /] Starting signed URL generation");
        const promisesURL = array.map(async (fileUrl, index) => {
            const realFileurl = fileUrl.replace("\n", "");
            console.log(`[POST /] Generating signed URL ${index + 1}/${array.length} for: ${realFileurl}`);
            
            const finalURL = await generateSignedUrl(realFileurl);
            console.log(`[POST /] Signed URL ${index + 1} generated successfully`);
            
            return finalURL;
        });

        console.log("[POST /] Waiting for all signed URLs to be generated");
        const returnArray = await Promise.all(promisesURL);
        console.log(`[POST /] All signed URLs generated. Count: ${returnArray.length}`);

        console.log("[POST /] Sending successful response");
        res.json({
            message: returnArray
        });

    } catch (error) {
        console.error("[POST /] Error occurred:", error);
        console.error("[POST /] Error stack:", error.stack);
        res.status(400).json(error);
    }
});

module.exports = {
    featureExtractRouter
};