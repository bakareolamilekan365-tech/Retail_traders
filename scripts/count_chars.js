const fs = require("fs");
const s = fs.readFileSync("frontend/src/App.jsx", "utf8");
const counts = {
  openCurly: (s.match(/\{/g) || []).length,
  closeCurly: (s.match(/\}/g) || []).length,
  openParen: (s.match(/\(/g) || []).length,
  closeParen: (s.match(/\)/g) || []).length,
  backticks: (s.match(/`/g) || []).length,
  openAngle: (s.match(/</g) || []).length,
  closeAngle: (s.match(/>/g) || []).length,
};
console.log(counts);
