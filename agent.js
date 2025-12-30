export class HRAgent {
  constructor(apiBase = "") {
    this.apiBase = apiBase;
  }

  async chat(userMessage, history = []) {
    try {
      const response = await fetch(`${this.apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
      });
      if (!response.ok) {
        const error = await response.text();
        return {
          success: false,
          text: error || "Chat service is unavailable.",
          source: "System Error",
        };
      }
      const data = await response.json();
      return {
        success: true,
        text: data.text,
        source: data.source || "OpenAI",
      };
    } catch (error) {
      console.error("Chat API Error:", error);
      return {
        success: false,
        text: "I'm having trouble connecting right now. Please try again later.",
        source: "System Error",
      };
    }
  }
}
