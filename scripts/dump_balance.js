const fs=require('fs');
const lines=fs.readFileSync('frontend/src/App.jsx','utf8').split(/\r?\n/);
let curly=0, paren=0;
for(let i=0;i<lines.length;i++){
  const line=lines[i];
  for(const ch of line){
    if(ch==='{') curly++;
    if(ch==='}') curly--;
    if(ch==='(') paren++;
    if(ch===')') paren--;
  }
  if(i>560 && i<820) console.log((i+1).toString().padStart(4), 'curly=', curly,'paren=',paren,'|', line);
}
console.log('final', {curly, paren});
