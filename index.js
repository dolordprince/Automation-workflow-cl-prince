app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
