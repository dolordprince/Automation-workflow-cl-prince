const express = require("express");
const path = require("path");

const app = express();

const PUBLIC_DIR = path.join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));

app.get("/admin", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "../admin/index.html"));
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("SERVER_RUNNING:", PORT);
});

process.on("SIGINT", () => {
  console.log("SHUTDOWN");
  server.close(() => process.exit(0));
});
