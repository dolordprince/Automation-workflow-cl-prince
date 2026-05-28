#!/usr/bin/env node
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ollama = require("ollama");

const HF_API = process.env.HF_API_KEY ? `https://api-inference.huggingface.co/models/${process.env.HF_MODEL || "Qwen/Qwen2.5-Coder-32B-Instruct"}` : null;

async function callHuggingFace(prompt) {
  if (!HF_API || !process.env.HF_API_KEY) throw new Error("HF not configured");
  const res = await fetch(HF_API, {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.HF_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 2048 } })
  });
  if (!res.ok) throw new Error(`HF ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data[0].generated_text : data.generated_text;
}

async function callOllama(prompt) {
  const response = await ollama.chat({
    model: process.env.OLLAMA_MODEL || "deepseek-r1:1.5b",
    messages: [{ role: "user", content: prompt }],
    stream: false
  });
  return response?.message?.content || response?.response || "";
}

function generateStaticFallback(topic) {
  return `<!DOCTYPE html><html><head><title>${topic}</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0f0f1a,#1a1a2e);color:#e6e6ff;margin:0;padding:2rem}.container{max-width:1200px;margin:0 auto}.hero{text-align:center;padding:4rem 2rem}h1{font-size:2.5rem;margin:0 0 1rem;background:linear-gradient(90deg,#7c3aed,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.dashboard{background:#1e1e3f;border-radius:1rem;padding:2rem;margin-top:2rem;box-shadow:0 10px 40px rgba(0,0,0,.3)}</style></head><body><div class="container"><div class="hero"><h1>✨ ${topic}</h1><p>AI-generated premium template • Fallback mode</p></div><div class="dashboard"><h3>📊 Dashboard Preview</h3><p>Content generated with static fallback. Configure Ollama/HF for dynamic AI.</p></div></div></body></html>`;
}

async function main() {
  const topic = process.argv[2] || "AI Web Application";
  console.log(`🏗️  PROJECT: ${topic}`);
  const prompt = `Generate a single-file HTML landing page for: "${topic}". Include: modern dark luxury design, gradient accents, responsive layout, dashboard preview section, CTA buttons, and inline CSS. No external dependencies. Output ONLY valid HTML, no markdown, no explanations.`;
  let html = "";
  try { console.log("🤖 Trying HuggingFace..."); html = await callHuggingFace(prompt); } 
  catch (hfErr) { console.warn(`⚠️  HF FAILED: ${hfErr.message}`); }
  if (!html || html.length < 100) {
    try { console.log("🔄 Falling back to Ollama..."); html = await callOllama(prompt); } 
    catch (ollamaErr) { console.warn(`⚠️  OLLAMA FAILED: ${ollamaErr.message}`); }
  }
  if (!html || !html.trim().startsWith("<")) {
    console.warn("⚠️  AI returned invalid HTML. Using premium fallback template.");
    html = generateStaticFallback(topic);
  }
  const outDir = path.join(process.cwd(), "generated", topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  console.log("✅ FILES GENERATED");
  console.log(`📁 Output: ${outDir}/index.html`);
  if (process.env.AUTO_PUSH === "true" && process.env.GITHUB_TOKEN) {
    try {
      console.log("📤 PUSHING TO GITHUB...");
      execSync("git add -A", { stdio: "ignore" });
      execSync(`git commit -m "chore: generate ${topic}" || true`, { stdio: "ignore" });
      execSync("git push", { stdio: "ignore" });
    } catch (e) {}
  }
}
main().catch(err => { console.error("❌ Agent error:", err.message); process.exit(1); });