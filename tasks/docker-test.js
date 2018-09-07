console.log("=== docker test is running ===");

const fs = require("fs");

console.log("under WORKING, ", fs.readdirSync("./"));
console.log("under discord anvil, ", fs.readdirSync("/app/node_modules/discord-anvil"));
