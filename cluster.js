const { jobQueue } = require("./queue");

async function addJob(type, payload) {
  return await jobQueue.add(type, payload, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  });
}

module.exports = { addJob };
