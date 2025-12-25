
import { GoogleGenAI, Type } from "@google/genai";
import { Ingredient, Recipe } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function scanImageForIngredients(base64Image: string): Promise<Ingredient[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Identify all food ingredients in this image. For each, specify name, category (produce, dairy, meat, pantry, spice, or other), freshness level, and estimated quantity. Return as a JSON array." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            freshness: { type: Type.STRING },
            quantity: { type: Type.STRING },
          },
          required: ["name", "category", "freshness", "quantity"]
        }
      }
    }
  });

  const rawData = JSON.parse(response.text || '[]');
  return rawData.map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9)
  }));
}

export async function generateRecipesFromIngredients(
  availableIngredients: Ingredient[],
  preferences: string[] = []
): Promise<Recipe[]> {
  const ingredientNames = availableIngredients.map(i => i.name).join(', ');
  const prompt = `Based on these ingredients: ${ingredientNames}. ${preferences.length > 0 ? `Consider these preferences: ${preferences.join(', ')}.` : ""} Suggest 3 diverse recipes. For each, provide: title, description, cookingTime (min), difficulty (Easy, Medium, Hard), ingredients list with amounts, step-by-step instructions, nutrition (calories, protein, carbs, fats), and dietary tags. Return as a JSON array.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            cookingTime: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  substituted: { type: Type.BOOLEAN }
                }
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fats: { type: Type.STRING }
              }
            },
            dietaryTags: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchScore: { type: Type.NUMBER }
          },
          required: ["title", "description", "cookingTime", "difficulty", "ingredients", "instructions", "nutrition"]
        }
      }
    }
  });

  const recipes = JSON.parse(response.text || '[]');
  return recipes.map((r: any) => ({
    ...r,
    id: Math.random().toString(36).substr(2, 9),
    image: `https://picsum.photos/seed/${encodeURIComponent(r.title)}/600/400`
  }));
}
