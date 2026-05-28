const { Worker } = require("bullmq");
const IORedis = require("ioredis");

const builder = require("./agents/builder");
const tester = require("./agents/tester");
const deployer = require("./agents/deployer");

const connection = new IORedis({
  maxRetriesPerRequest: null
});

const handlers = {
  build: builder,
  test: tester,
  deploy: deployer
};

new Worker(
  "jobs",
  async (job) => {
    const handler = handlers[job.name];
    if (!handler) throw new Error("Unknown job type");
    return await handler(job);
  },
  { connection }
);

console.log("CLUSTER WORKER ONLINE");
