// const spawn=require("child_process").spawn;


//  function PythonFileCaller(fileName,option)
// {
   
//     return new Promise((resolve,reject)=>{
//     try{
      
//     pythonFile ="python/OCR.py"
    
//     const process= spawn("python3",[pythonFile,fileName]);

//     let data = "";
//     let errorData = "";

//     process.stdout.on("data", (chunk) => {
//       // Collect all output from the Python script
//       data += chunk.toString();
//     });

//     process.stderr.on("data", (chunk) => {
//       // Collect all error output from the Python script
//       errorData += chunk.toString();
//     });

//     process.on("close", (code) => {
      
//       if (code === 0) {

//         resolve(data);
//       } else {
//         // Error
//         console.error(`Python script stderr: ${errorData}`);
        
//         reject(new Error(`Python script exited with code ${code}. Error: ${errorData}`));
//       }
//     });
//     process.on("error", (err) => {
//       // Handle errors like 'python3' not being found
//       console.error("Failed to start subprocess.", err);
//       reject(err);
//     });
//     }
// catch(error)
// {
//     reject(JSON.stringify(error));
// }
// })
    
  
// }

// module.exports={
//     PythonFileCaller
// }
const spawn = require("child_process").spawn;

function PythonFileCaller(fileName, option) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`[PythonFileCaller] Starting process for file: ${fileName}`);
            pythonFile = "python/OCR.py";
            console.log(`[PythonFileCaller] Using Python script: ${pythonFile}`);
            
            const process = spawn("python3", [pythonFile, fileName]);
            console.log(`[PythonFileCaller] Python process spawned with PID: ${process.pid}`);
            
            let data = "";
            let errorData = "";

            process.stdout.on("data", (chunk) => {
                // Collect all output from the Python script
                const chunkStr = chunk.toString();
                console.log(`[PythonFileCaller] Received stdout chunk (${chunkStr.length} chars): ${chunkStr.substring(0, 100)}${chunkStr.length > 100 ? '...' : ''}`);
                data += chunkStr;
            });

            process.stderr.on("data", (chunk) => {
                // Collect all error output from the Python script
                const chunkStr = chunk.toString();
                console.log(`[PythonFileCaller] Received stderr chunk: ${chunkStr}`);
                errorData += chunkStr;
            });

            process.on("close", (code) => {
                console.log(`[PythonFileCaller] Python process closed with code: ${code}`);
                console.log(`[PythonFileCaller] Total stdout data length: ${data.length} chars`);
                console.log(`[PythonFileCaller] Total stderr data length: ${errorData.length} chars`);
                
                if (code === 0) {
                    console.log(`[PythonFileCaller] Process completed successfully, resolving with data`);
                    resolve(data);
                } else {
                    // Error
                    console.error(`[PythonFileCaller] Python script stderr: ${errorData}`);
                    console.error(`[PythonFileCaller] Process failed with exit code: ${code}`);
                    reject(new Error(`Python script exited with code ${code}. Error: ${errorData}`));
                }
            });

            process.on("error", (err) => {
                // Handle errors like 'python3' not being found
                console.error("[PythonFileCaller] Failed to start subprocess.", err);
                reject(err);
            });

        } catch (error) {
            console.error("[PythonFileCaller] Exception caught in try block:", error);
            reject(JSON.stringify(error));
        }
    });
}

module.exports = {
    PythonFileCaller
};