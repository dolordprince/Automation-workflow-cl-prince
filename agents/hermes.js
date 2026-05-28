require("dotenv").config()

const fs = require("fs-extra")
const path = require("path")
const axios = require("axios")
const ollama = require("ollama")
const simpleGit = require("simple-git")

const git = simpleGit()

const GENERATED_DIR = path.join(process.cwd(), "generated-app")

async function askGPTOSS(prompt) {
  try {
    const res = await axios.post(
      "https://api-inference.huggingface.co/models/openai/gpt-oss-120b",
      {
        inputs: prompt
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        timeout: 600000
      }
    )

    return res.data[0].generated_text
  } catch (err) {
    console.log("GPT-OSS FAILED")
    return null
  }
}

async function askOllama(model, prompt) {
  const response = await ollama.generate({
    model,
    prompt,
    stream: false
  })

  return response.response
}

async function generateWebsite(prompt) {
  console.log("GENERATING WEBSITE...")
  console.log("USING GPT-OSS-120B")

  let result = await askGPTOSS(prompt)

  if (!result) {
    console.log("FALLING BACK TO DEEPSEEK")

    result = await askOllama(
      process.env.FALLBACK_MODEL,
      `
Generate a COMPLETE premium Node.js SaaS website.

Requirements:
- multi page
- landing page
- admin dashboard
- responsive
- animations
- testimonials
- gradients
- premium colorful UI
- hero section
- charts
- pricing
- crypto analytics
- dark mode
- express backend
- production ready

USER REQUEST:
${prompt}
`
    )
  }

  await fs.ensureDir(GENERATED_DIR)

  await fs.writeFile(
    path.join(GENERATED_DIR, "generation.txt"),
    result
  )

  console.log("AI GENERATION COMPLETE")
}

async function autoPush() {
  console.log("PUSHING TO GITHUB")

  await git.add("./*")
  await git.commit("AI generated update")
  await git.push("origin", "main")

  console.log("PUSH COMPLETE")
}

async function main() {
  const prompt = process.argv.slice(2).join(" ")

  if (!prompt) {
    console.log("PROMPT REQUIRED")
    process.exit(1)
  }

  await generateWebsite(prompt)

  if (process.env.AUTO_PUSH === "true") {
    await autoPush()
  }
}

main()
