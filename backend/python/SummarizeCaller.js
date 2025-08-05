const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const path = require('path');
const dotenv=require("dotenv")
const {Storage }=require("@google-cloud/storage")
const os =require("os")

dotenv.config();

const gcs = new Storage();

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_AI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });


async function DonwloadFromGcs(CloudFilePath)
{
    try{
        const gcsMatch = CloudFilePath.match(/^gs:\/\/([^\/]+)\/(.+)$/);
    if (!gcsMatch) {
      throw new Error('Invalid GCS path format. Expected: gs://bucket-name/path/to/file');
    }
   // console.log(gcsMatch)
    const bucketName=gcsMatch[1];
    const FileName=gcsMatch[2]; 
    const tempDir=path.join(__dirname,"../../FileStorage");
    const localFileName=path.basename(FileName);
    const localFilePath=path.join(tempDir,localFileName)

    await gcs
    .bucket(bucketName)
    .file(FileName)
    .download({destination:localFilePath})

    return localFilePath;
}
    catch(error)
    {
        throw new Error(`Error downloading file from GCS: ${error.message}`);
    }
}
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Error extracting PDF text try the FIX PDF option`);
  }
}




// Split text into chunks if it's too long
function splitTextIntoChunks(text, maxChunkSize = 30000) {
  const chunks = [];
  const paragraphs = text.split('\n\n');
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        // If single paragraph is too long, split by sentences
        const sentences = paragraph.split('. ');
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = sentence;
            } else {
              chunks.push(sentence.trim());
            }
          } else {
            currentChunk += (currentChunk ? '. ' : '') + sentence;
          }
        }
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Summarize a single chunk of text
async function summarizeChunk(text, summaryType = 'detailed') {
  const prompts=`
  give a summary in detail in plain text no need to add highlight and bold syntax of the document where,
  the PROMPT is :${summaryType},
  
  and only following this context of :${text}
  `
  try {
    const result = await model.generateContent(prompts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Error generating summary: ${error.message}`);
  }
}


async function combineSummaries(summaries) {
  const combinedText = summaries.join('\n\n---\n\n');
  const prompt = `Please create a comprehensive summary by combining the following individual summaries. Remove redundancy and create a cohesive overview:\n\n${combinedText}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Error combining summaries: ${error.message}`);
  }
}

// Main summarization function
async function summarizeDocument(CloudFilePath, options = {}) {
  const {
    summaryType = 'detailed',
    maxLength = 500,
    includeKeywords = false
  } = options;

  try{
    const filePath=await DonwloadFromGcs(CloudFilePath);
    const text = await extractTextFromPDF(filePath);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in the document');
    }

    // Split into chunks if text is too long
    const chunks = splitTextIntoChunks(text);
    let summaries = [];
    
    // Summarize each chunk
    for (let i = 0; i < chunks.length; i++) {
      const summary = await summarizeChunk(chunks[i], summaryType);
      summaries.push(summary);
      
      // Add delay to respect rate limits
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Combine summaries if there are multiple chunks
    let finalSummary;
    if (summaries.length > 1) {
      finalSummary = await combineSummaries(summaries);
    } else {
      finalSummary = summaries[0];
    }

    // Extract keywords if requested
    let keywords = null;
    if (includeKeywords) {
      const keywordPrompt = `Extract 5-10 key terms/keywords from this summary:\n\n${finalSummary}`;
      const keywordResult = await model.generateContent(keywordPrompt);
      const keywordResponse = await keywordResult.response;
      keywords = keywordResponse.text();
    }
    await fs.unlink(filePath);
    return {
      summary: finalSummary,
      keywords: keywords,
    };

  } catch (error) {
    throw {error:error};
  }

}




// Export functions for use in other modules
module.exports = {
  summarizeDocument
};

