const fs = require("fs");
const path = require('path');
module.exports = function changeConfig ({property, value}) {
  const settingsPath = path.join(__dirname, 'settings.json');
  const file = fs.readFileSync(settingsPath, "utf8");
  const fileJson = JSON.parse(file);
  fileJson[property] = value;
  fs.writeFileSync(settingsPath, JSON.stringify(fileJson, null, 2));
}