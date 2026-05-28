#!/usr/bin/env node
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");

// ─── CONFIG ────────────────────────────────────────────────────────
const HF_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";
const FALLBACK_OLLAMA_MODEL = "deepseek-r1:1.5b";
const GITHUB_REPO = process.env.GITHUB_REPO || "https://github.com/dolordprince/prince-ai-platform.git";
const RENDER_API_KEY = process.env.RENDER_API_KEY;
const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;
const HF_TOKEN = process.env.HF_TOKEN;

// ─── SYSTEM PROMPT ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an elite frontend architect. Generate a COMPLETE, PRODUCTION-READY Node.js SaaS website.

REQUIREMENTS:
- Single-file HTML with embedded CSS and JavaScript
- Premium dark mode luxury fintech design
- Animated hero section with gradient text and glassmorphism
- Features grid with hover animations
- Testimonials carousel
- Pricing table with highlighted tier
- Interactive dashboard preview section
- Responsive navbar with mobile hamburger menu
- Footer with links and newsletter signup
- Smooth scroll animations (intersection observer based)
- Premium color palette: deep navy (#050816), electric blue (#0072ff), purple (#8e2de2), cyan (#00c6ff)
- Google Fonts: Inter + Space Grotesk
- All assets via CDN or inline SVGs only
- Mobile-first responsive design

OUTPUT FORMAT: Return ONLY raw HTML. No markdown. No explanations. No code fences. Start with <!DOCTYPE html> and end with </html>.`;

// ─── GENERATE WITH HUGGINGFACE ─────────────────────────────────────
async function generateWithHF(prompt) {
  console.log(`🤖 USING HUGGINGFACE: ${HF_MODEL}`);

  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions`,
    {
      model: HF_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 8192,      temperature: 0.7
    },
    {
      headers: { Authorization: `Bearer ${HF_TOKEN}` },
      timeout: 120000
    }
  );

  return response.data.choices?.[0]?.message?.content || "";
}

// ─── GENERATE WITH OLLAMA (FALLBACK) ───────────────────────────────
async function generateWithOllama(prompt) {
  console.log(`🦙 FALLBACK TO OLLAMA: ${FALLBACK_OLLAMA_MODEL}`);
  const ollama = require("ollama");

  const response = await ollama.chat({
    model: FALLBACK_OLLAMA_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ]
  });

  return response.message?.content || "";
}

// ─── STRIP MARKDOWN FENCES ─────────────────────────────────────────
function cleanHTML(raw) {
  return raw
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

// ─── MAIN BUILD PIPELINE ──────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("❌ PROMPT REQUIRED");
    console.log('   Usage: node agents/hermes.js "build a luxury fintech landing page"');
    process.exit(1);
  }

  const prompt = args.join(" ");
  const projectName = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")    .substring(0, 40) || "ai-generated-site";

  const projectDir = path.join(__dirname, "..", "generated", projectName);

  // Create directory structure
  fs.mkdirSync(path.join(projectDir, "public"), { recursive: true });
  fs.mkdirSync(path.join(projectDir, "admin"), { recursive: true });

  console.log("");
  console.log(`🏗️  PROJECT: ${projectName}`);
  console.log(`📁 DIR: ${projectDir}`);
  console.log("");

  // ── Generate HTML ──────────────────────────────────────────────
  let html = "";
  try {
    html = await generateWithHF(prompt);
  } catch (err) {
    console.log(`⚠️  HF FAILED: ${err.message}`);
    console.log("🔄 Falling back to Ollama...");
    try {
      html = await generateWithOllama(prompt);
    } catch (err2) {
      console.log(`❌ OLLAMA ALSO FAILED: ${err2.message}`);
    }
  }

  html = cleanHTML(html);

  if (!html || !html.includes("<html")) {
    console.log("⚠️  AI returned invalid HTML. Using premium fallback template.");
    html = buildFallbackTemplate(projectName);
  }

  // ── Write Files ────────────────────────────────────────────────
  fs.writeFileSync(path.join(projectDir, "public", "index.html"), html);

  fs.writeFileSync(path.join(projectDir, "admin", "index.html"), buildAdminTemplate(projectName));

  fs.writeFileSync(path.join(projectDir, "server.js"), `
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public"));
app.use("/admin", express.static("admin"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ RUNNING ON PORT " + PORT));
`.trim());

  fs.writeFileSync(path.join(projectDir, "package.json"), JSON.stringify({
    name: projectName,
    version: "1.0.0",
    main: "server.js",
    scripts: { start: "node server.js" },
    dependencies: { express: "^4.21.0" }
  }, null, 2));

  fs.writeFileSync(path.join(projectDir, "render.yaml"), `
services:
  - type: web
    name: ${projectName}
    env: node
    plan: free
    autoDeploy: true
    buildCommand: npm install
    startCommand: node server.js
    healthCheckPath: /health
`.trim());

  fs.writeFileSync(path.join(projectDir, ".gitignore"), `node_modules\n.env\ndump.rdb\n*.log\n`);

  console.log("✅ FILES GENERATED");
  console.log("");

  // ── Push to GitHub ─────────────────────────────────────────────
  console.log("📤 PUSHING TO GITHUB...");
  try {
    execSync(`
      cd "${projectDir}"
      git init -q
      git branch -M main
      git remote remove origin 2>/dev/null || true
      git remote add origin "${GITHUB_REPO}"
      git add -A
      git commit -m "🤖 AI Generated: ${projectName}" -q
      git push -u origin main --force
    `, { stdio: "inherit", shell: "/bin/bash" });
    console.log("✅ GITHUB PUSH COMPLETE");
  } catch (err) {
    console.log(`❌ GITHUB PUSH FAILED: ${err.message}`);
  }
  console.log("");
  // ── Deploy to Render ───────────────────────────────────────────
  console.log("🚀 TRIGGERING RENDER DEPLOY...");
  try {
    if (!RENDER_API_KEY || !RENDER_SERVICE_ID) {
      console.log("⚠️  RENDER_API_KEY or RENDER_SERVICE_ID not set in .env");
      console.log("   Skipping automatic deploy. Push to GitHub manually triggers auto-deploy.");
    } else {
      await axios.post(
        `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys`,
        {},
        { headers: { Authorization: `Bearer ${RENDER_API_KEY}` } }
      );
      console.log("✅ RENDER DEPLOY TRIGGERED");
    }
  } catch (err) {
    console.log(`⚠️  RENDER DEPLOY ERROR: ${err.response?.data?.message || err.message}`);
    console.log("   Auto-deploy from GitHub push should still work.");
  }
  console.log("");

  // ── Output URLs ────────────────────────────────────────────────
  const liveUrl = `https://${projectName}.onrender.com`;
  console.log("═══════════════════════════════════════════");
  console.log("  ✅ DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════");
  console.log(`  🌐 USER URL:  ${liveUrl}`);
  console.log(`  🔧 ADMIN URL: ${liveUrl}/admin`);
  console.log("═══════════════════════════════════════════");
  console.log("");
}

// ─── FALLBACK TEMPLATE ─────────────────────────────────────────────
function buildFallbackTemplate(name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#050816;color:#fff;font-family:'Inter',sans-serif;overflow-x:hidden}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:2rem;position:relative}
.hero::before{content:'';position:absolute;width:600px;height:600px;background:radial-gradient(circle,rgba(0,114,255,.15),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(2.5rem,6vw,5rem);line-height:1.1;margin-bottom:1.5rem;background:linear-gradient(135deg,#00c6ff,#0072ff,#8e2de2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:fadeInUp .8s ease}
p.sub{font-size:1.25rem;color:#94a3b8;max-width:600px;margin-bottom:2.5rem;animation:fadeInUp 1s ease}
.btn{display:inline-block;padding:1rem 2.5rem;background:linear-gradient(135deg,#0072ff,#8e2de2);border-radius:50px;color:#fff;text-decoration:none;font-weight:600;transition:transform .2s,box-shadow .2s;animation:fadeInUp 1.2s ease}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 40px rgba(0,114,255,.4)}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}</style>
</head>
<body>
<section class="hero">
<h1>${name.replace(/-/g,' ')}</h1>
<p class="sub">Premium AI-generated SaaS platform with luxury fintech design, smooth animations, and responsive layout.</p>
<a href="#" class="btn">Get Started →</a>
</section>
<script>
const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='translateY(0)'}})},{threshold:.1});
document.querySelectorAll('section').forEach(s=>{s.style.opacity=0;s.style.transform='translateY(30px)';s.style.transition='all .6s ease';obs.observe(s)});
</script>
</body></html>`;
}

// ─── ADMIN TEMPLATE ────────────────────────────────────────────────
function buildAdminTemplate(name) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${name} | Admin</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-white min-h-screen p-8">
<h1 class="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">${name.replace(/-/g,' ')} — Admin Dashboard</h1>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
<div class="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p class="text-zinc-400 text-sm">Users</p><p class="text-3xl font-bold mt-2">12,480</p></div>
<div class="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p class="text-zinc-400 text-sm">Revenue</p><p class="text-3xl font-bold mt-2">$84,200</p></div>
<div class="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p class="text-zinc-400 text-sm">Growth</p><p class="text-3xl font-bold mt-2 text-green-400">+62%</p></div>
</div>
<div class="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
<h2 class="text-xl font-semibold mb-4">AI Website Generator</h2>
<textarea id="prompt" class="w-full h-40 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-white resize-none focus:outline-none focus:border-blue-500" placeholder="Describe the website you want to generate..."></textarea>
<button onclick="build()" class="mt-4 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition">Generate Website</button>
<pre id="output" class="mt-6 bg-zinc-950 p-4 rounded-xl text-xs text-green-400 overflow-auto max-h-60 hidden"></pre>
</div>
<script>
async function build(){
  const prompt=document.getElementById('prompt').value;
  if(!prompt)return alert('Enter a prompt');
  const out=document.getElementById('output');
  out.classList.remove('hidden');
  out.textContent='⏳ Generating...';
  try{
    const res=await fetch('/build',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    const data=await res.json();
    out.textContent=JSON.stringify(data,null,2);
  }catch(e){out.textContent='Error: '+e.message}
}</script>
</body></html>`;
}

// ─── GUARD: Only run when executed directly (NOT when required/imported) ──
if (require.main === module) {
  main().catch(err => {
    console.error("💥 FATAL:", err);
    process.exit(1);
  });
}
