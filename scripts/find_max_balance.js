const fs = require("fs");
const lines = fs.readFileSync("frontend/src/App.jsx", "utf8").split(/\r?\n/);
let curly = 0,
  paren = 0,
  maxCurly = 0,
  maxLine = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (ch === "{") curly++;
    if (ch === "}") curly--;
    if (ch === "(") paren++;
    if (ch === ")") paren--;
  }
  if (curly > maxCurly) {
    maxCurly = curly;
    maxLine = i + 1;
  }
}
console.log("maxCurly at line", maxLine, "value", maxCurly);
console.log("final curly", curly, "final paren", paren);
console.log("context around max:");
for (
  let i = Math.max(0, maxLine - 6);
  i < Math.min(lines.length, maxLine + 6);
  i++
) {
  console.log((i + 1).toString().padStart(4), "|", lines[i]);
}
