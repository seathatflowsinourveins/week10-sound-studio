'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),destination=path.join(root,'dist');
const D=require('../course-data.js'),G=require('../lesson-guide.js'),{wav,zip,sketchHTML}=require('./assets.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
// Only named public assets enter the release. Private class files and raw research stay outside.
const files=['index.html','studio.css','core.js','course-data.js','lesson-guide.js','illustrations.js','runtime.js','studio.js','README.md','THIRD_PARTY.md','SOURCES.md','LICENSE','vendor/p5.min.js','vendor/p5-LICENSE.txt','vendor/p5.sound.min.js','vendor/p5.sound.js','vendor/p5.sound-LICENSE.txt','vendor/sound-bundled-notices.txt'];
const entries=new Map(files.map(name=>[name,fs.readFileSync(path.join(root,name))]));
const sounds=Array.from({length:5},(_,i)=>['sound-'+i+'.wav',wav(i)]);
for(const [name,data]of sounds)entries.set(name,data);
function guideText(lesson){
 const guide=G.lessons[lesson.id];
 return ['# '+lesson.title,'','Goal: '+guide.goal,'','Before: '+guide.before,'','## One small practice at a time','',...lesson.steps.flatMap((step,i)=>[(i+1)+'. '+step.do,'   Notice: '+step.notice,'   Guide line '+(lesson.lines.findIndex(line=>line.code.trim()===guide.focus[i])+1)+'.','']),'## Every code line','',...lesson.lines.map((line,i)=>(i+1)+'. `'+line.code.replace(/`/g,'\\`')+'` — '+line.meaning+(line.detail?' '+line.detail:'')),'','## Check the idea','',guide.check.question,'',...guide.check.options.map((text,i)=>(i+1)+'. '+text),'','Explanation: '+guide.check.why,'','Before continuing: '+guide.success,'','## Connected class sources','',...guide.sources.map(id=>{const r=D.resources.find(x=>x.id===id);return '- ['+r.title+']('+r.url+') — '+r.summary;}),'','This is teaching practice, not a completed class submission.',''].join('\n');
}
const manifest=['# Week 10 Sound Studio','','[Open the guide](./index.html#unlock). Read one line, try one small change, notice the result, then explain. Diagram controls are silent; actual p5 controls make sound.','','## Your learning order','',...D.lessons.flatMap((lesson,i)=>{const g=G.lessons[lesson.id];return ['### '+(i+1)+'. '+lesson.title,'','Goal: '+g.goal,'','Before: '+g.before,'',...lesson.steps.map((step,j)=>(j+1)+'. '+step.do+' Notice: '+step.notice),'','Check: '+g.check.question,'','Before continuing: '+g.success,'','[Open lesson](./index.html#'+lesson.id+') · [Every line explained](./lessons/'+lesson.id+'/GUIDE.md) · [Prepared files](./lessons/'+lesson.id+'/files.zip)',''];}),'## Five worksheet tasks','',...D.worksheet.flatMap(task=>[task.number+'. **'+task.title+'** — '+task.deliverable+(task.challenge?' Challenge: '+task.challenge:''),'']),'## How to read code','',...G.syntax.map(item=>'- **'+item.term+'** — '+item.meaning+' Example: `'+item.example+'`'),'','## Coding and sound foundations','',...D.foundations.map(item=>'- **'+item.term+'** — '+item.meaning),'','## Complete class material map','',...D.resources.map(r=>'- ['+r.title+']('+r.url+') — '+r.summary+(r.version?' Version: '+r.version:'')+(r.access?' Access: '+r.access:'')),'','## Your work','','Concept checks do not submit work. Keep your own listening notes and worksheet links. Export progress to another device. The 60-second composition is the Week 11 bridge.',''];
entries.set('MANIFEST.md',Buffer.from(manifest.join('\n')));
const instructions='WEEK 10 SOUND PRACTICE\n\nRead GUIDE.md for the goal, steps, every code line and class source links.\n\n1. Create a new sketch in https://editor.p5js.org/\n2. Replace sketch.js and index.html.\n3. Upload sound-0.wav through sound-4.wav beside sketch.js.\n4. Run; use the sketch button or canvas to enable audio.\n5. Save your own link for the class worksheet.\n\nLibrary scripts need internet. Pins: p5 2.3.4 + p5.sound 0.4.1.\nThe WAVs are original synthesized practice tones (MIT licensed).\nFor local use, serve over HTTP, not file://.\nMicrophone permission is optional and stays with you.\n';
for(const lesson of D.lessons){
 const code=lesson.lines.map(x=>x.code).join('\n')+'\n',html=sketchHTML(lesson.title),guide=guideText(lesson),bundle=[['index.html',html],['sketch.js',code],['GUIDE.md',guide],...sounds,['README.txt',instructions],['LICENSE',fs.readFileSync(path.join(root,'LICENSE'))]];
 for(const [name,data]of [['sketch.js',code],['index.html',html],['GUIDE.md',guide],['files.zip',zip(bundle)],...sounds])entries.set('lessons/'+lesson.id+'/'+name,Buffer.isBuffer(data)?data:Buffer.from(data));
}
const release=hash(Buffer.concat([...entries].sort(([a],[b])=>a.localeCompare(b)).flatMap(([name,data])=>[Buffer.from(name+'\0'),data]))).slice(0,16);
let html=entries.get('index.html').toString().replace('checked 10 Nov 2026','checked 10 Nov 2026 · build '+release);
for(const name of ['studio.css','core.js','course-data.js','lesson-guide.js','illustrations.js','runtime.js','studio.js'])html=html.replace('./'+name+'"','./'+name+'?v='+release+'"');
entries.set('index.html',Buffer.from(html));
const hashes=[...entries].map(([name,data])=>({path:name,bytes:data.length,sha256:hash(data)})).sort((a,b)=>a.path.localeCompare(b.path));
entries.set('release.json',Buffer.from(JSON.stringify({release,checked:'2026-11-10',p5:'2.3.4',p5sound:'0.4.1',lessons:D.lessons.length,lines:D.lessons.reduce((n,l)=>n+l.lines.length,0),resources:D.resources.length,files:hashes},null,2)+'\n'));
fs.mkdirSync(destination,{recursive:true});
function existing(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?existing(path.join(dir,e.name)):[path.relative(destination,path.join(dir,e.name)).split(path.sep).join('/')]);}
const expected=new Set(entries.keys()),stale=existing(destination).filter(name=>!expected.has(name));
if(stale.length)throw Error('Unexpected old dist files; inspect before removing: '+stale.join(', '));
for(const [name,data]of entries){const target=path.join(destination,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);}
console.log(JSON.stringify({release,files:entries.size,lessons:D.lessons.length,lines:D.lessons.reduce((n,l)=>n+l.lines.length,0),resources:D.resources.length}));
