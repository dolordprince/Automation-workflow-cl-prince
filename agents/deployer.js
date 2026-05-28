const { exec } = require("child_process");

module.exports = async (job) => {
  console.log("DEPLOYING:", job.data);

  return new Promise((resolve, reject) => {
    exec(
      "git add . && git commit -m 'auto deploy' && git push",
      (err, stdout) => {
        if (err) return reject(err);
        resolve({ deployed: true, output: stdout });
      }
    );
  });
};
