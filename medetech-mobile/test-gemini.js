const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in environment variables");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log("Fetching available models...");
    // Note: listModels is not directly exposed on the main class in some versions, 
    // but let's try to get a model and see if we can infer or use the model manager if available.
    // Actually, for the JS SDK, we might not have a direct listModels method exposed easily in the helper.
    // Let's try a simple generation with a known fallback like 'gemini-pro' to see if auth works.
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Attempting to generate content with gemini-1.5-flash...");
    const result = await model.generateContent("Hello");
    console.log("Success! gemini-1.5-flash is working.");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
    
    try {
        console.log("Attempting to generate content with gemini-2.0-flash-exp...");
        const model3 = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result3 = await model3.generateContent("Hello");
        console.log("Success! gemini-2.0-flash-exp is working.");
    } catch (error3) {
        console.error("Error with gemini-2.0-flash-exp:", error3.message);
    }
  }
}

listModels();
