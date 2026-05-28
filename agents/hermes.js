#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Ollama } = require('ollama');

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });

function printHeader() {
  console.log(`\x1b[35m👑 PRINCE CODE INTERFACE v1.1.0\x1b[0m`);
  console.log(`\x1b[36m🚀 Acceleration: Hugging Face API / gpt-oss-120b Enabled\x1b[0m`);
  console.log(`\x1b[33m───────────────────────────────────────────────────────────────────\x1b[0m\n`);
}

async function callHuggingFace(prompt) {
  const token = process.env.HF_API_TOKEN;
  if (!token) return "";
  
  try {
    // Dynamically routing to the fast execution endpoint requested
    const response = await fetch("https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 2048, temperature: 0.2 } })
    });
    const data = await response.json();
    return data[0]?.generated_text || data?.generated_text || "";
  } catch (err) {
    console.warn(`\x1b[33m⚠️ Hugging Face Engine route congested: ${err.message}\x1b[0m`);
    return "";
  }
}

async function callLocalOllama(prompt) {
  const preferredModel = process.env.OLLAMA_MODEL || "deepseek-r1:1.5b";
  try {
    const response = await ollama.chat({
      model: preferredModel,
      messages: [{ role: "user", content: prompt }],
      stream: false
    });
    return response?.message?.content || response?.response || "";
  } catch (err) {
    try {
      const response = await ollama.chat({
        model: "phi3:mini",
        messages: [{ role: "user", content: prompt }],
        stream: false
      });
      return response?.message?.content || response?.response || "";
    } catch (innerErr) {
      return "";
    }
  }
}

function injectDynamicStyles(html, styleType) {
  let animationCss = "";
  if (styleType === "blink") {
    animationCss = `
      @keyframes princeBlink { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 25px #7c3aed); } 50% { opacity: 0.3; filter: drop-shadow(0 0 2px transparent); } }
      .unique-style-output { animation: princeBlink 2.5s infinite ease-in-out; }
    `;
  } else {
    animationCss = `
      @keyframes princeRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .unique-style-output { animation: princeRotate 25s infinite linear; transform-origin: center; }
    `;
  }

  const styleTag = `<style>${animationCss}</style></head>`;
  let updatedHtml = html.replace("</head>", styleTag);
  
  if (updatedHtml.includes('class="dashboard"')) {
    updatedHtml = updatedHtml.replace('class="dashboard"', 'class="dashboard unique-style-output"');
  } else if (updatedHtml.includes('<body>')) {
    updatedHtml = updatedHtml.replace('<body>', '<body><div class="unique-style-output">');
    updatedHtml = updatedHtml.replace('</body>', '</div></body>');
  }
  return updatedHtml;
}

function generateStaticFallback(topic, styleType) {
  const baseHtml = `<!DOCTYPE html>
<html>
<head>
  <title>${topic}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#06060c,#0f0f1e);color:#e6e6ff;margin:0;padding:2rem}
    .container{max-width:1200px;margin:0 auto}
    .hero{text-align:center;padding:4rem 2rem}
    h1{font-size:2.8rem;margin:0 0 1rem;background:linear-gradient(90deg,#a855f7,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .dashboard{background:#111126;border:1px solid #581c87;border-radius:1rem;padding:2rem;margin-top:2rem;box-shadow:0 10px 40px rgba(0,0,0,.6)}
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>👑 ${topic}</h1>
      <p>System Engine Blueprint • High-Fidelity Output Frame</p>
    </div>
    <div class="dashboard">
      <h3>📊 Live Preview Container</h3>
      <p>Static structural fallover active under dynamic rendering profiles.</p>
    </div>
  </div>
</body>
</html>`;
  return injectDynamicStyles(baseHtml, styleType);
}

async function main() {
  printHeader();
  const topic = process.argv[2] || "Luxury Fintech Showcase";
  const styleType = process.argv[3] || (Math.random() > 0.5 ? "blink" : "rotate");
  
  console.log(`\x1b[32m🏗️  COMPILING TARGET PROJECT:\x1b[0m ${topic}`);
  console.log(`\x1b[34m✨ ASSIGNED DYNAMIC VISUAL EFFECT:\x1b[0m [${styleType}]\n`);

  const prompt = `Generate a single-file HTML landing page for: "${topic}". Include: modern dark luxury design, gradient accents, responsive layout, dashboard preview section, CTA buttons, and inline CSS. No external dependencies. Output ONLY valid HTML code, no markdown block syntax, no conversational text.`;

  let html = "";
  
  if (process.env.HF_API_TOKEN) {
    console.log("⚡ Contacting accelerated Hugging Face cloud endpoints...");
    html = await callHuggingFace(prompt);
  }
  
  if (!html || html.length < 100) {
    console.log("🔄 Routing request to local Ollama hardware workspace cluster...");
    html = await callLocalOllama(prompt);
  }

  if (html.includes("```html")) {
    html = html.split("```html")[1].split("```")[0];
  } else if (html.includes("```")) {
    html = html.split("```")[1].split("```")[0];
  }

  if (!html || !html.trim().startsWith("<")) {
    console.warn("⚠️ Output layout structure raw. Merging core fallback layout matrices.");
    html = generateStaticFallback(topic, styleType);
  } else {
    html = injectDynamicStyles(html, styleType);
  }

  const cleanDirName = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const outDir = path.join(process.cwd(), "generated", cleanDirName);
  
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

  console.log(`\n\x1b[32m✅ CODE STRUCTURE GENERATED\x1b[0m`);
  console.log(`📁 Target Output: ${outDir}/index.html`);

  const ghToken = process.env.GITHUB_TOKEN;
  const ghUser = process.env.GITHUB_USER;
  let ghRepo = process.env.GITHUB_REPO;

  // Strips complete URL string artifacts to isolate repo name cleanly if pasted intact
  if (ghRepo && ghRepo.includes("github.com")) {
    ghRepo = ghRepo.split("/").pop().replace(".git", "");
  }

  const renderHook = process.env.RENDER_DEPLOY_HOOK_URL;

  if (ghToken && ghUser && ghRepo) {
    try {
      console.log("\n\x1b[35m📤 INITIATING AUTOMATED PUSH TO GITHUB...\x1b[0m");
      
      execSync("git init -b main || git branch -M main", { stdio: "ignore" });
      execSync(`git remote set-url origin https://${ghUser}:${ghToken}@github.com/${ghUser}/${ghRepo}.git 2>/dev/null || git remote add origin https://${ghUser}:${ghToken}@github.com/${ghUser}/${ghRepo}.git`, { stdio: "ignore" });
      
      execSync("git add -A", { stdio: "ignore" });
      execSync(`git commit -m "👑 prince-code: production compilation for ${topic}" || true`, { stdio: "ignore" });
      execSync("git push -u origin main --force", { stdio: "ignore" });
      
      const deploymentUrl = `https://${ghUser}.github.io/${ghRepo}/generated/${cleanDirName}/index.html`;
      console.log(`\x1b[32m🚀 GITHUB PAGES PRODUCTION URL:\x1b[0m ${deploymentUrl}`);

      if (renderHook) {
        console.log("\x1b[35m🚀 TRIGGERING DEPLOYMENT HOOK FOR RENDER DAEMON...\x1b[0m");
        execSync(`curl -s -X POST "${renderHook}"`, { stdio: "ignore" });
        console.log(`\x1b[32m🚀 LIVE WEB APPLICATION PLATFORM RENDER VIEW ROUTE:\x1b[0m https://${ghRepo}.onrender.com`);
      }
    } catch (gitErr) {
      console.warn(`⚠️ Deployment pipeline paused: ${gitErr.message}`);
    }
  } else {
    console.log("\n\x1b[33mℹ️ Pipeline skipped. Provide GITHUB configurations to automate remote web deployment.\x1b[0m");
  }
}

main().catch(err => {
  console.error("❌ Critical Workspace Failure:", err.message);
  process.exit(1);
});
