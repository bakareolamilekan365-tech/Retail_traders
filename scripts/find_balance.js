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
    if(curly<0 || paren<0){
      console.log('Negative balance at line', i+1, 'char', ch);
      process.exit(0);
    }
  }
  if(curly===0 && paren===0) continue;
  if(i%50===0){} // noop
}
console.log('Final balances', {curly, paren});
for(let i=0;i<lines.length;i++){
  // print some context where curly increases
  if(lines[i].includes('mobileMenuOpen')||lines[i].includes('Sidebar')||lines[i].includes('onOpenMenu')){
    console.log(i+1, lines[i]);
  }
}
