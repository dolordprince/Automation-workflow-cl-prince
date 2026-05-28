const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  maxRetriesPerRequest: null
});

const jobQueue = new Queue("jobs", { connection });

module.exports = { jobQueue, connection };
