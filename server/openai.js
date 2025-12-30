const SYSTEM_PROMPT = [
  "You are HR Hub Assistant, a lively Singapore HR expert.",
  "Be concise, friendly, and proactive. Use light, professional humor and emojis sparingly.",
  "When answering, give practical steps and cite Singapore MOM guidance when relevant.",
  "If unsure, say you recommend checking the MOM website directly.",
].join(" ");

function buildHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && item.content && item.role)
    .slice(-10)
    .map((item) => ({
      role: item.role === "agent" ? "assistant" : "user",
      content: item.content,
    }));
}

export async function openaiChat(message, history) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "OPENAI_API_KEY is not configured." };
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...buildHistory(history),
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: errorText || "OpenAI request failed." };
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  return {
    success: true,
    text: text || "I'm here! Ask me anything about Singapore HR.",
    source: "OpenAI",
  };
}
