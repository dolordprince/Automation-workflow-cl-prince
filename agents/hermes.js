#!/usr/bin/env node
require('dotenv').config();
const fs = require('path') ? require('fs') : require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Ollama } = require('ollama');

const ollama = new Ollama();

async function callOllama(prompt) {
  try {
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || "deepseek-r1:1.5b",
      messages: [{ role: "user", content: prompt }],
      stream: false
    });
    return response?.message?.content || response?.response || "";
  } catch (err) {
    console.warn(`⚠️  OLLAMA EXECUTOR FAILED: ${err.message}`);
    return "";
  }
}

function generateStaticFallback(topic) {
  return `<!DOCTYPE html><html><head><title>${topic}</title><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0f0f1a,#1a1a2e);color:#e6e6ff;margin:0;padding:2rem}.container{max-width:1200px;margin:0 auto}.hero{text-align:center;padding:4rem 2rem}h1{font-size:2.5rem;margin:0 0 1rem;background:linear-gradient(90deg,#7c3aed,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.dashboard{background:#1e1e3f;border-radius:1rem;padding:2rem;margin-top:2rem;box-shadow:0 10px 40px rgba(0,0,0,.3)}</style></head><body><div class="container"><div class="hero"><h1>✨ ${topic}</h1><p>Premium System Template • Generated via Failover Engine</p></div><div class="dashboard"><h3>📊 Dashboard Preview</h3><p>Content generated with static fallback. Verify Ollama initialization status.</p></div></div></body></html>`;
}

async function main() {
  const topic = process.argv[2] || "AI Web Application";
  console.log(`\n🏗️  PROJECT: ${topic}`);
  
  const prompt = `Generate a single-file HTML landing page for: "${topic}". Include: modern dark luxury design, gradient accents, responsive layout, dashboard preview section, CTA buttons, and inline CSS. No external dependencies. Output ONLY valid HTML, no markdown codeblocks, no explanations.`;
  
  let html = "";
  
  console.log("🔄 Contacting Ollama Node controller...");
  html = await callOllama(prompt);
  
  // Strip out markdown formatting wrapping blocks if deepseek accidental outputs it
  if (html.includes("```html")) {
    html = html.split("```html")[1].split("```")[0];
  } else if (html.includes("```")) {
    html = html.split("```")[1].split("```")[0];
  }

  if (!html || !html.trim().startsWith("<")) {
    console.warn("⚠️  AI returned invalid layout structure. Merging with system core fallback layout.");
    html = generateStaticFallback(topic);
  }
  
  const cleanDirName = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const outDir = path.join(process.cwd(), "generated", cleanDirName);
  
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
  
  console.log("✅ FILES GENERATED SUCCESSFULLY");
  console.log(`📁 Target Output: ${outDir}/index.html`);
  
  if (process.env.AUTO_PUSH === "true" && process.env.GITHUB_TOKEN) {
    try {
      console.log("📤 PUSHING REPOSITORY STACK TO GITHUB...");
      execSync("git add -A", { stdio: "ignore" });
      execSync(`git commit -m "chore: generate ${topic}" || true`, { stdio: "ignore" });
      execSync("git push", { stdio: "ignore" });
    } catch (e) {
      console.warn("⚠️  Git routine skipped or remote authentication timed out.");
    }
  }
}

main().catch(err => {
  console.error("❌ Agent error:", err.message);
  process.exit(1);
});
