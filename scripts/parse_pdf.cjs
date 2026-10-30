const fs = require('fs');
const zlib = require('zlib');

function cleanPdfString(raw) {
  let s = raw.replace(/\\([()\\])/g, '$1');
  let clean = '';
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) === 0) continue;
    clean += s[i];
  }
  return clean.trim();
}

const buf = fs.readFileSync('public/assets/aistudio/murid4-6_9a23a954.pdf');
let pos = 0;
let allPageItems = [];

while (true) {
  let start = buf.indexOf('stream', pos);
  if (start === -1) break;
  let streamStart = start + 6;
  if (buf[streamStart] === 13 && buf[streamStart+1] === 10) streamStart += 2;
  else if (buf[streamStart] === 10) streamStart += 1;
  else if (buf[streamStart] === 13) streamStart += 1;

  let end = buf.indexOf('endstream', streamStart);
  if (end === -1) break;
  let streamData = buf.subarray(streamStart, end);
  try {
    let decomp = zlib.inflateSync(streamData);
    let str = decomp.toString('binary');
    let btMatches = [...str.matchAll(/BT\s+([\s\S]*?)\s+ET/g)];
    let pageItems = [];
    for (let m of btMatches) {
      let inner = m[1];
      let td = inner.match(/([0-9.-]+)\s+([0-9.-]+)\s+Td/);
      let tj = inner.match(/\((.*?)\)\s*Tj/);
      if (tj) {
        let x = td ? parseFloat(td[1]) : 0;
        let y = td ? parseFloat(td[2]) : 0;
        let text = cleanPdfString(tj[1]);
        if (text) {
          pageItems.push({ x, y, text });
        }
      }
    }
    if (pageItems.length > 0) {
      allPageItems.push(pageItems);
    }
  } catch(e) {}
  pos = end + 9;
}

console.log('Pages parsed:', allPageItems.length);
fs.writeFileSync('parsed_pages.json', JSON.stringify(allPageItems, null, 2));
