const fs = require("fs");

if (fs.existsSync("./title.txt")) {
    fs.copyFileSync("./title.txt", "dist/title.txt");
}
else {
    throw new Error("Title file not copied because it does not exist");
}