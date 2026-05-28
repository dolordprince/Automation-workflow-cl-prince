#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Ollama } = require('ollama');

// Initialize local context connection
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });

function printHeader() {
  console.log(`\x1b[35m👑 PRINCE CODE INTERFACE v1.0.0\x1b[0m`);
  console.log(`\x1b[36m🤖 Connected Models: deepseek-r1:1.5b, phi3:mini, gpt-oss-120b\x1b[0m`);
  console.log(`\x1b[33m───────────────────────────────────────────────────────────────────\x1b[0m\n`);
}

async function callAI(prompt) {
  // Model cascading strategy: 1. Custom Remote/HuggingFace Endpoint -> 2. Local DeepSeek -> 3. Local Phi3
  const preferredModel = process.env.OLLAMA_MODEL || "deepseek-r1:1.5b";
  try {
    const response = await ollama.chat({
      model: preferredModel,
      messages: [{ role: "user", content: prompt }],
      stream: false
    });
    return response?.message?.content || response?.response || "";
  } catch (err) {
    console.warn(`\x1b[33m⚠️  Primary engine failed. Routing traffic to fallback model (phi3:mini)...\x1b[0m`);
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
      @keyframes princeBlink { 0%, 100% { opacity: 1; filter: drop-shadow(0 0 15px #7c3aed); } 50% { opacity: 0.4; filter: drop-shadow(0 0 2px transparent); } }
      .unique-style-output { animation: princeBlink 2s infinite ease-in-out; }
    `;
  } else {
    animationCss = `
      @keyframes princeRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .unique-style-output { animation: princeRotate 20s infinite linear; transform-origin: center; }
    `;
  }

  const styleTag = `<style>${animationCss}</style></head>`;
  let updatedHtml = html.replace("</head>", styleTag);
  
  // Wrap core dashboard preview panel in the styled animator component class
  if (updatedHtml.includes('class="dashboard"')) {
    updatedHtml = updatedHtml.replace('class="dashboard"', 'class="dashboard unique-style-output"');
  } else {
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
    body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#0a0a14,#121225);color:#e6e6ff;margin:0;padding:2rem}
    .container{max-width:1200px;margin:0 auto}
    .hero{text-align:center;padding:4rem 2rem}
    h1{font-size:2.8rem;margin:0 0 1rem;background:linear-gradient(90deg,#9333ea,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .dashboard{background:#161630;border:1px solid #3b0764;border-radius:1rem;padding:2rem;margin-top:2rem;box-shadow:0 10px 40px rgba(0,0,0,.5)}
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>👑 ${topic}</h1>
      <p>Prince Code Shell Engine • Core Structure</p>
    </div>
    <div class="dashboard">
      <h3>📊 System Live Preview</h3>
      <p>Generated template layout under dynamic animation parameters.</p>
    </div>
  </div>
</body>
</html>`;
  return injectDynamicStyles(baseHtml, styleType);
}

async function main() {
  printHeader();
  const topic = process.argv[2] || "Luxury Fintech Showcase";
  
  // Alternate execution output visual types dynamically based on arguments or environment configurations
  const styleType = process.argv[3] || (Math.random() > 0.5 ? "blink" : "rotate");
  console.log(`\x1b[32m🏗️  COMPILING TARGET PROJECT:\x1b[0m ${topic}`);
  console.log(`\x1b[34m✨ ASSIGNED DYNAMIC VISUAL EFFECT:\x1b[0m Class manipulation [${styleType}]\n`);

  const prompt = `Generate a single-file HTML landing page for: "${topic}". Include: modern dark luxury design, gradient accents, responsive layout, dashboard preview section, CTA buttons, and inline CSS. No external dependencies. Output ONLY valid HTML code. No markdown formatting.`;

  console.log("⚡ Contacting active LLM workspace cluster...");
  let html = await callAI(prompt);

  if (html.includes("```html")) {
    html = html.split("```html")[1].split("```")[0];
  } else if (html.includes("```")) {
    html = html.split("```")[1].split("```")[0];
  }

  if (!html || !html.trim().startsWith("<")) {
    console.warn("⚠️  AI generation format issue. Generating structural failover layout matrix...");
    html = generateStaticFallback(topic, styleType);
  } else {
    html = injectDynamicStyles(html, styleType);
  }

  const cleanDirName = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const outDir = path.join(process.cwd(), "generated", cleanDirName);
  
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");

  console.log(`\n\x1b[32m✅ RENDER READY CODE MATRIX WRITTEN\x1b[0m`);
  console.log(`📁 Target Output: ${outDir}/index.html`);

  // Handle fully automated GitHub and Deployment Pipeline
  const ghToken = process.env.GITHUB_TOKEN;
  const ghUser = process.env.GITHUB_USER;
  const ghRepo = process.env.GITHUB_REPO;
  const renderHook = process.env.RENDER_DEPLOY_HOOK_URL;

  if (ghToken && ghUser && ghRepo) {
    try {
      console.log("\n\x1b[35m📤 INITIATING HEADLESS PUSH TO GITHUB TARGET...\x1b[0m");
      
      // Clear up local changes and switch upstream auth context to non-interactive token url
      execSync("git init -b main || git branch -M main", { stdio: "ignore" });
      execSync(`git remote set-url origin https://${ghUser}:${ghToken}@github.com/${ghUser}/${ghRepo}.git 2>/dev/null || git remote add origin https://${ghUser}:${ghToken}@github.com/${ghUser}/${ghRepo}.git`, { stdio: "ignore" });
      
      execSync("git add -A", { stdio: "ignore" });
      execSync(`git commit -m "👑 prince-code: build updates for ${topic}" || true`, { stdio: "ignore" });
      execSync("git push -u origin main --force", { stdio: "ignore" });
      
      const deploymentUrl = `https://${ghUser}.github.io/${ghRepo}/generated/${cleanDirName}/index.html`;
      console.log(`\x1b[32m🚀 GITHUB PAGES PRODUCTION URL:\x1b[0m ${deploymentUrl}`);

      if (renderHook) {
        console.log("\x1b[35m🚀 TRIGGERING REMOTE RENDER PRODUCTION BUILD PIPELINE...\x1b[0m");
        execSync(`curl -s -X POST "${renderHook}"`, { stdio: "ignore" });
        // Infers render public domain base route from repo setup naming defaults
        console.log(`\x1b[32m🚀 LIVE INSTANT RENDER CONTAINER WEB VIEW ROUTE:\x1b[0m https://${ghRepo}.onrender.com`);
      }
    } catch (gitErr) {
      console.warn(`⚠️ Deployment execution pipeline paused: ${gitErr.message}`);
    }
  } else {
    console.log("\n\x1b[33mℹ️ Git options skipped. Export GITHUB_TOKEN, GITHUB_USER, GITHUB_REPO to track builds.\x1b[0m");
  }
}

main().catch(err => {
  console.error("❌ Critical Stack Crash:", err.message);
  process.exit(1);
});
