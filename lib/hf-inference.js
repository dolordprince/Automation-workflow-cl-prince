const HF_API_TOKEN = process.env.HF_API_TOKEN;
const MODEL = "deepseek-ai/DeepSeek-V3";

async function chat(prompt, systemPrompt = "You are a helpful assistant.") {
  if (!HF_API_TOKEN) throw new Error("HF_API_TOKEN not set");

  const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    // HF model cold-start — retry once
    if (err.includes("loading")) {
      console.log("⏳ HF model loading, retrying in 20s...");
      await new Promise(r => setTimeout(r, 20000));
      return chat(prompt, systemPrompt);
    }
    throw new Error(`HF API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

module.exports = { chat };
