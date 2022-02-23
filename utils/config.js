const fs = require("fs");
module.exports = function changeConfig ({property, value}) {
  const file = fs.readFileSync("./settings.json", "utf8");
  const fileJson = JSON.parse(file);
  fileJson[property] = value;
  fs.writeFileSync("./settings.json", JSON.stringify(fileJson, null, 2));
}