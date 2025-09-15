import { GoogleGenAI, Type } from "@google/genai"

import dotenv from "dotenv"
dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY })

const model = "gemini-2.0-flash"

const tripPlanConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      itinerary: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        coordinates: {
                          type: Type.OBJECT,
                          properties: {
                            latitude: { type: Type.NUMBER },
                            longitude: { type: Type.NUMBER },
                          },
                        },
                      },
                      propertyOrdering: ["id", "name", "coordinates"],
                    },
                  },
                },
                propertyOrdering: ["category", "options"],
              },
            },
          },
          propertyOrdering: ["day", "categories"],
        },
      },
    },
  },
}

export const getTripPlanByDays = async ({ startPoint, endPoint, places, days }) => {
  // No caching - always generate fresh plan

  try {
    const prompt = `
      You are given a trip plan with a start point, an end point, and a list of places.
      Your task is to create a **day-by-day itinerary** for ${days} days.

      Rules:
      - Use ONLY the data provided in JSON (do not invent new places).
      - For each day, group places by category.
      - For each category, suggest up to **3 options** from the provided places.
      - Cover the trip until all places are used.
      - Keep logical flow: start from startPoint, finish at endPoint.
      - Amount of days must be considered (${days} days).

      JSON data:
      Start: ${JSON.stringify(startPoint)}
      End: ${JSON.stringify(endPoint)}
      Places: ${JSON.stringify(places)}
      Days: ${JSON.stringify(days)}
    `

    const response = await ai.models.generateContent({
      model,
      config: tripPlanConfig,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const answer = JSON.parse(response?.text)
    console.log("✅ GEMINI Trip plan generated:", answer)

    // No caching - return fresh answer

    return answer
  } catch (err) {
    console.error("❌ GEMINI Error generating trip plan:", err)
    res.status(500).json({
      error: "Failed to generate trip plan",
      details: err.message,
    })
  }
}
