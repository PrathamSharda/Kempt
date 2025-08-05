const spawn=require("child_process").spawn;
const dotenv=require("dotenv");
dotenv.config();

function RagCaller(fileName,question,userid)
{
  const googleApiKey=process.env.GOOGLE_API_KEY;

  return new Promise((resolve,reject)=>{
    try{
      
    pythonFile ="python/QandA.py"
    let process;
    if(question==null||question==undefined||userid==null||userid==undefined)
      throw{error:"no question asked"};
    if(fileName!==null&&fileName!==undefined)
    {
      process = spawn("python3", [
        pythonFile,
        "process-and-query",
        "--file", fileName,
        "--google-api-key", googleApiKey,
        "--user-id",userid,
        "--question",question,
        "-Q"
    ]);
    }
    else{
      process = spawn("python3", [
        pythonFile,
        "query",
        "--google-api-key", googleApiKey,
        "--user-id",userid,
        "--question",question,
        "-Q"
    ]);
    }
  
    let data = "";
    let errorData = "";

    process.stdout.on("data", (chunk) => {
     
      data += chunk.toString();
    });

    process.stderr.on("data", (chunk) => {
      // Collect all error output from the Python script
      errorData += chunk.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        // Success
        
        //console.log(data);
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
    RagCaller
}