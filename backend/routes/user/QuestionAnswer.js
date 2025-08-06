const express = require("express");
const { Router } = require("express");
const qandaRouter = Router();
const multer = require("multer");
const { RagCaller } = require("../../python/RAGCaller");
const { Storage } = require("@google-cloud/storage");

qandaRouter.use(express.urlencoded({ extended: false }));

const gcs = new Storage();

const bucket = gcs.bucket("kemptstorage");

const uploadToGCS = (file,userid) => {
    return new Promise((resolve, reject) => {
        const fileName = `${userid}_${Date.now()}_${file.originalname}`;
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

qandaRouter.post("/", upload.array("files"), async (req, res, next) => {
    try {
        const files = req.files; 
        const prompt = req.body.prompt;
        const email=req.email;
        //console.log(email);
        if (!prompt || prompt.trim() === "") {
           throw { error: "Question not provided" };
        }
        
        let ans = "";
        
        // If there are files, process them
        if (files.length > 0) {
            const promises = files.map(async (file) => {
                try {
                    const gcsFilePath = await uploadToGCS(file,email);
                    return await RagCaller(gcsFilePath, prompt,email);
                } catch (error) {
                    throw { error: `File ${file.name} is causing an error` };
                }
            });
            
            const results = await Promise.all(promises);
            ans = results.join(' ');
        } else {
            ans = await RagCaller(null, prompt,email);
        }
        
        //console.log("QA processing completed");
        
        res.json({
            message: ans
        });
        
    } catch (error) {
        console.error("Error in Q&A processing:", error);
        res.status(400).json({ 
            error: error, 
            details: error.message 
        });
    }
});

module.exports = {
    qandaRouter
};