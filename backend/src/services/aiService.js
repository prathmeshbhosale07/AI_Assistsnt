import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const detectAction = (userContent) => {
  const lower = userContent.toLowerCase();
  if (lower.includes("play") && lower.includes("song")) {
    return "PLAY_SONG";
  }
  return "NONE";
};

export const getAIResponse = async ({
  messages,
  userLanguage,
  assistantName
}) => {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const possibleAction = detectAction(lastUserMessage);

  const systemPrompt = `You are ${assistantName}, a friendly and helpful virtual assistant. Respond naturally like a human would — be conversational, warm, and helpful. Keep answers concise but informative. If the user speaks in ${userLanguage}, respond in the same language.`;

  const chatContents = [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "assistant",
      content: `Hi! I'm ${assistantName}, your virtual assistant. How can I help you today?`
    },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content
    }))
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatContents,
      max_tokens: 512,
      temperature: 0.8,
    });

    const reply = response.choices[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    return {
      content: reply,
      action: possibleAction
    };
  } catch (err) {
    console.error("Groq API error:", err.response?.data || err.message);

    let errorMsg = "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
    if (err.status === 429 || err.response?.status === 429) {
      errorMsg = "My API quota has been exceeded on Groq. Please try again in a minute.";
    }

    return {
      content: errorMsg,
      action: possibleAction
    };
  }
};
