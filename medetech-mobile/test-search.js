const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testSearchTool() {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    tools: [{ googleSearch: {} }] 
  });

  try {
    console.log("Testing Google Search tool...");
    const result = await model.generateContent("What is the color of Biogesic tablet in the Philippines? Use google search.");
    console.log("Success!");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error with search tool:", error.message);
  }
}

testSearchTool();
