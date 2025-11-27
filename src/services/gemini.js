import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const evaluateMoat = async (stockCode) => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please add it to .env file.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const currentDate = new Date().toISOString().split('T')[0];

  const prompt = `
    Evaluate the economic moat of the stock with code: ${stockCode}.
    Current Date: ${currentDate}.
    Please evaluate based on the latest information available as of this date.
    
    Criteria to evaluate:
    1. Brand Monopoly
    2. Network Effect
    3. Economy of Scale
    4. High Barrier to Entry
    5. High Switching Cost

    For each criteria, provide an evaluation of exactly one of these three values: "High", "Low", or "None".
    Also provide a short description (around 3 short sentences) explaining why you evaluated the stock this way.
    
    Return the response in the following JSON format ONLY, do not include markdown formatting or explanations outside the JSON:
    {
      "brandMonopoly": "High/Low/None",
      "networkEffect": "High/Low/None",
      "economyOfScale": "High/Low/None",
      "highBarrierToEntry": "High/Low/None",
      "highSwitchingCost": "High/Low/None",
      "description": "Your short explanation here"
    }
  `;

  const generateWithModel = async (modelName) => {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              brandMonopoly: { type: "string" },
              networkEffect: { type: "string" },
              economyOfScale: { type: "string" },
              highBarrierToEntry: { type: "string" },
              highSwitchingCost: { type: "string" },
              description: { type: "string" }
            },
            required: ["brandMonopoly", "networkEffect", "economyOfScale", "highBarrierToEntry", "highSwitchingCost", "description"]
          }
        }
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      // Since responseMimeType is set, the text should be clean JSON
      const jsonString = response.text().trim();

      return JSON.parse(jsonString); // Should succeed now


    } catch (error) {
      console.warn(`Failed with model ${modelName}:`, error);
      throw error;
    }
  };

  try {
    // Try with Flash Lite first
    return await generateWithModel("gemini-2.5-flash-lite");
  } catch (error) {
    console.log("Falling back to gemini-2.5-flash...");
    try {
      // Fallback to Flash
      return await generateWithModel("gemini-2.5-flash");
    } catch (fallbackError) {
      console.error("All models failed:", fallbackError);
      throw fallbackError;
    }
  }
};
