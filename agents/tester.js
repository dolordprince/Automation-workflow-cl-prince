const http = require("http");

module.exports = async (job) => {
  console.log("TESTING:", job.data);

  return new Promise((resolve, reject) => {
    http.get("http://localhost:3000", (res) => {
      if (res.statusCode === 200) {
        resolve({ ok: true });
      } else {
        reject(new Error("Server failed"));
      }
    }).on("error", reject);
  });
};
