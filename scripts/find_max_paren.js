const fs=require('fs');
const lines=fs.readFileSync('frontend/src/App.jsx','utf8').split(/\r?\n/);
let paren=0, maxParen=0, maxLine=0;
for(let i=0;i<lines.length;i++){
  for(const ch of lines[i]){
    if(ch==='(') paren++;
    if(ch===')') paren--;
  }
  if(paren>maxParen){ maxParen=paren; maxLine=i+1; }
}
console.log('maxParen at line', maxLine, 'value', maxParen);
for(let i=Math.max(0,maxLine-6); i<Math.min(lines.length, maxLine+6); i++) console.log((i+1).toString().padStart(4),'|',lines[i]);
