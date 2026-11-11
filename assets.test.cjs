const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {wav,zip,crc32,sketchHTML}=require('./scripts/assets.cjs'),D=require('./course-data.js');
test('five original mono PCM samples have valid headers, quiet peaks and faded endpoints',()=>{
 const all=[];for(let i=0;i<5;i++){const b=wav(i);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt32LE(4),b.length-8);assert.equal(b.toString('ascii',8,16),'WAVEfmt ');assert.equal(b.readUInt16LE(20),1);assert.equal(b.readUInt16LE(22),1);assert.equal(b.readUInt32LE(24),22050);assert.equal(b.readUInt32LE(40),44100);let max=0,power=0;for(let j=44;j<b.length;j+=2){const s=b.readInt16LE(j)/32768;max=Math.max(max,Math.abs(s));power+=s*s;}assert(max<.4&&max>.1);assert(Math.sqrt(power/22050)>.03);assert.equal(b.readInt16LE(44),0);assert(Math.abs(b.readInt16LE(b.length-2))<20);all.push(b.toString('base64'));}assert.equal(new Set(all).size,5);
});
test('ZIP local entries preserve exact code, assets, CRC and safe paths',()=>{
 const entries=[['sketch.js','const a = 1;\n'],['sound-0.wav',wav(0)]],b=zip(entries);let offset=0;for(const [name,value]of entries){const bytes=Buffer.from(value),length=b.readUInt32LE(offset+18),nameLength=b.readUInt16LE(offset+26);assert.equal(b.readUInt32LE(offset),0x04034b50);assert.equal(b.toString('utf8',offset+30,offset+30+nameLength),name);const data=b.subarray(offset+30+nameLength,offset+30+nameLength+length);assert.deepEqual(data,bytes);assert.equal(b.readUInt32LE(offset+14),crc32(data));offset+=30+nameLength+length;}assert.equal(b.readUInt32LE(offset),0x02014b50);assert.equal(b.readUInt32LE(b.length-22),0x06054b50);assert.throws(()=>zip([['../private.txt','x']]));assert.equal(crc32(Buffer.from('123456789')),0xcbf43926);
});
test('exported sketches compile and pin the same two libraries as the studio',()=>{
 for(const l of D.lessons){new vm.Script(l.lines.map(x=>x.code).join('\n'));const html=sketchHTML(l.title);assert(html.includes('p5@2.3.4/lib/p5.min.js'));assert(html.includes('p5.sound@0.4.1/dist/p5.sound.min.js'));assert(html.includes('src="sketch.js"'));}
});
