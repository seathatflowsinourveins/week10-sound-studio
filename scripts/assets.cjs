'use strict';
// Original synthesized assets. No teacher recordings or microphone capture.
const frequencies=[220,277.18,329.63,392,440];
function wav(index){
 const rate=22050,count=rate,buffer=Buffer.alloc(44+count*2),frequency=frequencies[index];
 if(!frequency)throw Error('Unknown sound index.');
 buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(count*2,40);
 for(let i=0;i<count;i++){const t=i/rate,envelope=Math.min(1,t/.03,(1-t)/.08)*Math.exp(-2*t),sample=.38*envelope*(Math.sin(2*Math.PI*frequency*t)+.22*Math.sin(2*Math.PI*frequency*2*t))/(1.22);buffer.writeInt16LE(Math.round(sample*32767),44+i*2);}
 return buffer;
}
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function zip(entries){
 const local=[],central=[];let offset=0;
 for(const [name,value]of entries){if(!/^[\w./-]+$/.test(name)||name.includes('..')||name.startsWith('/'))throw Error('Unsafe archive path.');const path=Buffer.from(name),data=Buffer.isBuffer(value)?value:Buffer.from(value),crc=crc32(data),header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x21,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(path.length,26);
  const dir=Buffer.alloc(46);dir.writeUInt32LE(0x02014b50);dir.writeUInt16LE(20,4);dir.writeUInt16LE(20,6);dir.writeUInt16LE(0x21,14);dir.writeUInt32LE(crc,16);dir.writeUInt32LE(data.length,20);dir.writeUInt32LE(data.length,24);dir.writeUInt16LE(path.length,28);dir.writeUInt32LE(offset,42);local.push(header,path,data);central.push(dir,path);offset+=header.length+path.length+data.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,directory,end]);
}
function sketchHTML(title){return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title>\n<script src="https://cdn.jsdelivr.net/npm/p5@2.3.4/lib/p5.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/p5.sound@0.4.1/dist/p5.sound.min.js"></script>\n<style>body{background:#0e1418;color:#edf4f3;font:14px system-ui;padding:12px}canvas{display:block;max-width:100%;height:auto!important}button,input,select{margin:5px;padding:8px}button:focus-visible{outline:2px solid #c5efac}</style></head><body>\n<script src="sketch.js"></script></body></html>\n';}
module.exports={wav,crc32,zip,sketchHTML,frequencies};
