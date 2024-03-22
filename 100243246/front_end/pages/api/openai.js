const OpenAI = require("openai");

export default async function handler(req, res) {
  
    const { inputFromClient, outputCard, outputPosition } = req.body;

  const openai = new OpenAI({
    apiKey: "netsepio#netsepio-1",
    baseURL: "https://llm-gateway.heurist.xyz",
  });

  try {
    const completions = await openai.chat.completions.create({
      model: "mistralai/mixtral-8x7b-instruct-v0.1",
      messages: [
        {
          role: "user",
          content: `You are a Major Arcana Tarot reader. Client asks this question “${inputFromClient}” and draws the “${outputCard}” card in “${outputPosition}” position. Interpret to the client in no more than 150 words.`,
        },
      ],
      maxTokens: 64,
      stream: true,
    });

    let result = "";

    for await (const part of completions) {
      result += part.choices[0]?.delta?.content || "";
    }

    res.status(200).json({ lyrics: result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}