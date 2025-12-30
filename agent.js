/**
 * GOOGLE AGENT DEVELOPMENT KIT (ADK) INTEGRATION
 * ------------------------------------------------
 * This file defines the "Compliance Agent" using the Google Gen AI SDK.
 * It uses the 'gemini-2.0-flash' model (or 1.5-flash) for fast responses.
 */

import { GoogleGenAI } from "@google/genai";

// 1. DATA GROUNDING (The "Knowledge" of the Agent)
// In a real ADK setup, this might come from a Vector Database or Vertex AI Search.
const HR_KNOWLEDGE_BASE = `
CURRENT DATE: December 2025
LOCATION: Singapore

KEY REGULATIONS 2025:
1. CPF Ceiling: $7,400 (Ordinary Wage).
2. Paternity Leave: 4 Weeks Mandatory (Govt-Paid) from April 1, 2025.
3. Shared Parental Leave: 6 weeks shared (New scheme).
4. Workplace Fairness Act (WFA): Passed Jan 2025, covers discrimination.
5. Employment Pass: Min salary $5,600 (General) / $6,200 (Finance).
6. Retirement Age: 63 (Re-employment to 68).

ROLE:
You are "HR Hub Assistant", a helpful Singapore HR expert.
You answer questions strictly based on Singapore Ministry of Manpower (MOM) rules.
Always be polite, concise, and use emojis.
If you don't know, say "I recommend checking the MOM website directly."
`;

// 2. AGENT DEFINITION
export class HRAgent {
  constructor(apiKey) {
    if (!apiKey) {
        console.warn("Agent initialized without API Key. Will fail if called.");
        return;
    }
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = "gemini-1.5-flash"; // Or 'gemini-2.0-flash-exp' if available
  }

  async chat(userMessage, history = []) {
    try {
      // Create the chat session with system instructions (The "Persona")
      const chat = this.client.getGenerativeModel({ 
        model: this.modelName,
        systemInstruction: HR_KNOWLEDGE_BASE 
      }).startChat({
        history: history.map(h => ({
            role: h.role === 'agent' ? 'model' : 'user',
            parts: [{ text: h.content }]
        }))
      });

      // Send the message
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return {
        success: true,
        text: response.text(),
        source: "Gemini AI (ADK)"
      };
    } catch (error) {
      console.error("ADK Agent Error:", error);
      return {
        success: false,
        text: "I'm having trouble connecting to my brain (Google API). Please check your API Key.",
        source: "System Error"
      };
    }
  }
}
