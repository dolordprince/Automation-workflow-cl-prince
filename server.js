const express = require("express")
const path = require("path")
const { exec } = require("child_process")

const app = express()

app.use(express.json())
app.use(express.static("public"))
app.use("/admin", express.static("admin"))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"))
})

app.post("/build", async (req, res) => {
  const prompt = req.body.prompt

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt required"
    })
  }

  exec(`node agents/hermes.js "${prompt}"`, (err, stdout, stderr) => {

    if (err) {
      return res.status(500).json({
        error: stderr
      })
    }

    res.json({
      success: true,
      output: stdout
    })
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON ${PORT}`)
})
