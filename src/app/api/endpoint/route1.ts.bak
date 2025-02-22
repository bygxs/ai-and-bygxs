// /src/app/api/endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    // Assuming you pass the prompt in the request body
    const { prompt } = await req.json();
    
    // Fetch the API Key from the environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    // Make the API request to Google Gemini
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }
    );

    return NextResponse.json(geminiResponse.data);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}