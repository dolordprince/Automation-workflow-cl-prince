module.exports = async (job) => {
  console.log("BUILDING:", job.data);

  return {
    status: "built",
    outputDir: "/root/davteam/generated/app"
  };
};
