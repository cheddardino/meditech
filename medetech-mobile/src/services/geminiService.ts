import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import { MedicineInfo } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || Constants.expoConfig?.extra?.geminiApiKey;
const IS_MOCK_MODE = !GEMINI_API_KEY;

if (!GEMINI_API_KEY && !IS_MOCK_MODE) {
  console.warn('⚠️ GEMINI_API_KEY not found. Please add it to your .env file.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const MODEL_NAME = "gemini-2.0-flash-exp";

const TARGET_MEDICINES = [
  // Paracetamol
  "Biogesic", "Tempra", "Calpol", "Tylenol", "Saridon",
  // Ibuprofen / Pain
  "Advil", "Medicol Advance", "Alaxan", "Alaxan FR", "Mefenamic Acid",
  // Cold & Flu
  "Bioflu", "Neozep Forte", "Tuseran Forte", "Coldzep",
  // Antihistamine
  "Cetirizine", "Loratadine", "Diphenhydramine",
  // Stomach
  "Kremil-S", "Diatabs",
  // Vitamins / Supplements
  "Centrum Advance", "Centrum Silver Advance", "Enervon", "Revicon", 
  "Stresstabs", "Conzace", "Pharmaton", "ImmunPro", 
  "Supraneuron", "Neurobion", "Pharex B-Complex"
];

const MEDICINE_VISUAL_DICTIONARY = {
  "Biogesic": "Orange and white blister pack, or orange oblong tablet with 'Biogesic' imprint.",
  "Neozep Forte": "Green blister pack, or green round tablet.",
  "Bioflu": "Orange and white capsule, or orange blister pack.",
  "Alaxan FR": "Red and orange capsule.",
  "Medicol Advance": "Red softgel capsule.",
  "Kremil-S": "Pink and white tablet.",
  "Diatabs": "White blister pack with green text, or white tablet.",
  "Enervon": "Orange tablet (sugar coated).",
  "Decolgen": "Yellow and orange tablet or blister pack.",
  "Solmux": "White tablet or capsule with red text.",
  "Tuseran": "Red capsule or blister pack."
};

const SYSTEM_PROMPT = `
You are an expert pharmacist assistant for the Philippines. 
Your goal is to identify medicines from images with EXTREME PRECISION, using both TEXT and VISUAL features.

TARGET MEDICINE LIST:
${TARGET_MEDICINES.join(", ")}

VISUAL REFERENCE GUIDE (Use this to identify medicines even if text is blurry):
${Object.entries(MEDICINE_VISUAL_DICTIONARY).map(([name, desc]) => `- ${name}: ${desc}`).join("\n")}

ANALYSIS STEPS:
1. TEXT RECOGNITION: Look for brand names, generic names, and dosage on the pill or packaging.
2. VISUAL MATCHING: Compare color, shape, and markings against the VISUAL REFERENCE GUIDE above.
3. ONLINE VERIFICATION (GROUNDING):
   - Use the Google Search tool to verify your visual findings.
   - Search for queries like "Biogesic tablet appearance Philippines" or "orange and white capsule Philippines medicine" to confirm matches.
   - If the visual features match the search results, increase your confidence.
4. CONFIDENCE CHECK: 
   - If text is clearly readable -> High Confidence (95-100%).
   - If text is blurry but VISUAL MATCH + ONLINE VERIFICATION is strong -> Medium-High Confidence (85-94%).
   - If neither text nor visual match is clear -> Low Confidence (<85%).

RESPONSE FORMAT (JSON ONLY):
{
  "name": "Brand Name" (or "Unknown"),
  "genericName": "Generic Name",
  "overview": "Brief usage description",
  "usage": "Primary indications/uses",
  "dosage": "Detected dosage (e.g. 500mg)",
  "sideEffects": ["Side effect 1", "Side effect 2"],
  "contraindications": ["Contraindication 1", "Contraindication 2"],
  "brandNames": ["List of known brand names in PH"],
  "confidenceScore": number (0-100),
  "disclaimer": "Standard medical disclaimer.",
  "analysis_notes": "Explain why you identified this. E.g., 'Text was blurry, but identified Biogesic based on unique orange/white oblong shape.'"
}
`;

const TEXT_IDENTIFICATION_PROMPT = `
You are MEDetech Assistant, a helpful AI that provides medicine information for users in the Philippines.

Your goal is to identify medicines based on user queries, which might be:
1. A brand name (e.g., "Biogesic")
2. A generic name (e.g., "Paracetamol")
3. A description of symptoms (e.g., "gamot sa sakit ng ulo")
4. A visual description (e.g., "orange na bilog na gamot")

OUTPUT FORMAT:
Respond ONLY with a valid JSON object.
{
  "name": "Medicine name",
  "genericName": "Generic name",
  "overview": "Description",
  "usage": "Indications",
  "dosage": "Typical dosage",
  "sideEffects": ["Side effect 1", "Side effect 2"],
  "contraindications": ["Contraindication 1", "Contraindication 2"],
  "brandNames": ["Available brands in PH"],
  "disclaimer": "Consultation disclaimer"
}
`;

class GeminiService {
  async identifyMedicineWithImage(base64Image: string): Promise<MedicineInfo> {
    // Check for internet connection first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection. Please check your network settings.');
    }

    // 1. Mock Response for Development
    if (IS_MOCK_MODE) {
      console.log('⚠️ Using MOCK Gemini Response');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return {
        name: "Biogesic (Mock)",
        genericName: "Paracetamol",
        overview: "Biogesic is a trusted brand of paracetamol...",
        usage: "Used for relief of minor aches and pains.",
        dosage: "500mg every 4-6 hours",
        sideEffects: ["Nausea", "Skin rash"],
        contraindications: ["Liver disease"],
        brandNames: ["Biogesic"],
        confidence: "high",
        disclaimer: "MOCK DATA: Consult a professional."
      } as MedicineInfo;
    }

    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Enable Google Search Tool for Grounding
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        tools: [{ googleSearch: {} } as any] 
      });
      
      const result = await model.generateContent([
        SYSTEM_PROMPT,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg",
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Clean the response to ensure valid JSON
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      // Enforce the 85% rule (lowered from 90% to allow strong visual matches)
      if (data.confidenceScore < 85) {
        return {
          name: "Unknown Medicine",
          genericName: "Unidentified",
          overview: "The image was not clear enough to identify with 85% confidence. Please retake the photo ensuring the text and shape are visible.",
          usage: "N/A",
          dosage: "N/A",
          sideEffects: [],
          contraindications: [],
          brandNames: [],
          confidence: "low",
          disclaimer: "Please consult a doctor or pharmacist.",
          analysis_notes: `Low confidence (${data.confidenceScore}%). ${data.analysis_notes}`
        };
      }

      return {
        name: data.name,
        genericName: data.genericName,
        overview: data.overview,
        usage: data.usage,
        dosage: data.dosage,
        sideEffects: data.sideEffects || [],
        contraindications: data.contraindications || [],
        brandNames: data.brandNames || [],
        confidence: data.confidenceScore >= 95 ? "high" : "medium",
        disclaimer: data.disclaimer || "Consult a healthcare professional.",
        analysis_notes: data.analysis_notes
      };

    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(error.message || 'Failed to identify medicine');
    }
  }

  async identifyMedicineWithText(query: string): Promise<MedicineInfo> {
    // Check for internet connection first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection. Please check your network settings.');
    }

    if (IS_MOCK_MODE) {
      console.log('⚠️ Using MOCK Gemini Response for Text');
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        name: "Neozep (Mock)",
        genericName: "Phenylephrine HCl + Chlorphenamine Maleate + Paracetamol",
        overview: "Neozep is used for the relief of clogged nose, runny nose, postnasal drip, itchy and watery eyes, sneezing, headache, body aches, and fever associated with the common cold, allergic rhinitis, sinusitis, flu, and other minor respiratory tract infections.",
        usage: "Relief of cold symptoms",
        dosage: "Adults and children 12 years and older: 1 tablet every 6 hours",
        sideEffects: ["Drowsiness", "Dizziness"],
        contraindications: ["High blood pressure", "Severe heart disease"],
        brandNames: ["Neozep Forte", "Neozep Non-Drowsy"],
        confidence: "high",
        disclaimer: "MOCK DATA: Consult a professional."
      } as MedicineInfo;
    }

    if (!genAI) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      const result = await model.generateContent([
        `${TEXT_IDENTIFICATION_PROMPT}\n\nUser Query: ${query}`
      ]);

      const response = await result.response;
      const text = response.text();

      // Clean the response to ensure valid JSON
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      return {
        name: data.name,
        genericName: data.genericName,
        overview: data.overview,
        usage: data.usage,
        dosage: data.dosage,
        sideEffects: data.sideEffects || [],
        contraindications: data.contraindications || [],
        brandNames: data.brandNames || [],
        confidence: "high",
        disclaimer: data.disclaimer || "Consult a healthcare professional.",
        analysis_notes: "Text search result"
      };
    } catch (error: any) {
      console.error('Gemini Text API Error:', error);
      throw new Error(error.message || 'Failed to identify medicine');
    }
  }
}

export default new GeminiService();
