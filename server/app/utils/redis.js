const { createClient } = require("redis");

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  },
});

client.on("error", (err) => {
  console.error("Redis error:", err);
});

let isConnected = false;

async function connectRedis() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("Redis connected");
  }
}

module.exports = {
  client,
  connectRedis,
};