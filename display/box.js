module.exports = function renderBox ({text: texts, extraInfo}) {
  if(!Array.isArray(texts)) {
    texts = [texts];
  }
  const boxTexts = texts.map((text, i) => {
    let boxText = ``;
    const textLines = text.split("\n");
    const longestLineLength = textLines.sort((a,b) => a.length>b.length)[0].length;
    const width = longestLineLength + (longestLineLength % 2 ? 4 : 6);
    const height = text.split("\n").length + 2;
    const textLinesParsed = textLines.flatMap((line, index) => Array.from(line).map((char, charIndex) => ({char, x: charIndex+(Math.floor(width/2)-Math.floor(line.length/2)), y: (index+Math.floor(height/2)-Math.floor(textLines.length/2))})));
    for(let y = 0; y < height; y++) {
      for(let x = 0; x < width; x++) {
        if(x === 0 || x === width-1) {
          boxText += "|";
          continue;
        } else {
          if(y === 0 || y == height-1) {
            boxText += "-";
            continue;
          } else {
            const char = textLinesParsed.find(char => char.x === x && char.y === y);
            if(char) {
              boxText += char.char;
              continue;
            }
            boxText += " ";
            continue;
          }
        }
      }
      boxText += extraInfo && extraInfo[i]?.split("\n")[y] || "";
      boxText += "\n";
    }
    return boxText;
  })
  return boxTexts.join("\n");
}