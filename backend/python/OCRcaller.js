const spawn=require("child_process").spawn;


 function PythonFileCaller(fileName,option)
{
   
    return new Promise((resolve,reject)=>{
    try{
      
    pythonFile ="python/OCR.py"
    //  console.log("here");
    const process= spawn("python3",[pythonFile,fileName]);
// console.log(process);
    let data = "";
    let errorData = "";

    process.stdout.on("data", (chunk) => {
      // Collect all output from the Python script
      data += chunk.toString();
    });

    process.stderr.on("data", (chunk) => {
      // Collect all error output from the Python script
      errorData += chunk.toString();
    });

    process.on("close", (code) => {
      
      if (code === 0) {

        resolve(data);
      } else {
        // Error
        console.error(`Python script stderr: ${errorData}`);
        
        reject(new Error(`Python script exited with code ${code}. Error: ${errorData}`));
      }
    });
    process.on("error", (err) => {
      // Handle errors like 'python3' not being found
      console.error("Failed to start subprocess.", err);
      reject(err);
    });
    }
catch(error)
{
    reject(JSON.stringify(error));
}
})
    
  
}

module.exports={
    PythonFileCaller
}