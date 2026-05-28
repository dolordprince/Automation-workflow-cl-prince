const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Prince AI Platform Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
