(function(){
 'use strict';
 const $=id=>document.getElementById(id),C=window.SoundCore,D=window.soundCourse,R=window.SoundRuntime;
 if(!C||!D||!R){$('lesson-title').textContent='The studio could not load.';$('preview-status').textContent='Reload, or use the written MANIFEST.md and original assignment link.';return;}
 const KEY='icm-week10-sound-v1',editor=$('practice-code'),frame=$('live-frame'),undo=new Map();let writable=true,store;
 try{const raw=localStorage.getItem(KEY);store=raw?C.normalize(JSON.parse(raw)):C.normalize({version:1});}catch{writable=false;store=C.normalize({version:1});}
 let lesson=null,line=0,step=0,token='',runCode='',sequence=0,currentView='learn',pendingImport=null;
 const diagram={frequency:220,volume:.05,wave:'sine',threshold:.1,level:0,base:131,ear:0};
 const sourceOf=item=>item.lines.map(entry=>entry.code).join('\n');
 function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
 function link(text,url){const a=node('a',text);const parsed=new URL(url,location.href);if(!['https:','http:'].includes(parsed.protocol))throw Error('Unsupported resource URL.');a.href=parsed.href;a.target='_blank';a.rel='noopener noreferrer';return a;}
 function persist(){if(writable){try{localStorage.setItem(KEY,JSON.stringify(store));}catch{writable=false;}}$('notes-status').textContent=writable?'Saved in this browser. Export to continue on another device.':'Browser storage is unavailable. Export progress to keep this session.';}
 function remember(){if(!lesson)return;store.lesson=lesson.id;store.positions[lesson.id]={line,step};persist();}
 function stopSound(){try{frame.contentWindow?.soundPreview?.stop();}catch{}$('audio-status').textContent='Audio stopped';if(token)$('preview-status').textContent='Stopped · press Run my code to prepare again';}
 function releasePreview(){stopSound();token='';frame.srcdoc='';}
 function run(){
  if(!lesson)return;releasePreview();runCode=editor.value;token='sound-'+Date.now()+'-'+(++sequence);$('preview-status').textContent='Loading drawing and sound libraries…';$('preview-status').classList.remove('error');$('audio-status').textContent='Audio off · use sketch controls';frame.srcdoc=R.frameHTML({code:runCode,token});
 }
 function drawRow(reveal=false){
  const clean=!!lesson&&editor.value===sourceOf(lesson),row=$('current-row');row.hidden=!clean;
  if(clean){const height=Number(getComputedStyle(editor).lineHeight.replace('px',''))||24,top=12+line*height;
   if(reveal&&document.activeElement!==editor){if(top<editor.scrollTop||top+height>editor.scrollTop+editor.clientHeight)editor.scrollTop=Math.max(0,top-editor.clientHeight/2);const caret=editor.value.split('\n').slice(0,line).reduce((sum,text)=>sum+text.length+1,0);editor.setSelectionRange(caret,caret);editor.scrollLeft=0;}
   row.style.top=(top-editor.scrollTop)+'px';row.style.height=height+'px';
  }
  $('draft-status').textContent=clean?'Lesson code · edits save here; press Run to test a change.':'Your edited draft is kept. It differs from the guide; press Run when ready.';
 }
 function svg(tag,attrs,parent=$('concept-svg')){const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,String(value));parent.append(el);return el;}
 function label(text,x,y,small=false){const el=svg('text',{x,y,...(small?{class:'small-label'}:{})});el.textContent=text;return el;}
 function wavePath(x,y,w,h,type,cycles,gain=1){return Array.from({length:161},(_,i)=>{const px=x+w*i/160,py=y-C.wave(type,i/160*cycles)*h*gain;return (i?'L':'M')+px.toFixed(2)+' '+py.toFixed(2);}).join(' ');}
 function illustrate(){
  const host=$('concept-svg');host.replaceChildren();const title=svg('title',{id:'concept-title'});title.textContent='Illustration for '+lesson.title;
  const accent='var(--accent)',muted='var(--muted)',blue='var(--blue)',amber='var(--amber)',border='var(--border)';
  const kind=lesson.illustration,n=value=>Number(value.toFixed(3));let caption='';
  if(kind==='array'){
   for(let i=0;i<5;i++){const x=12+i*82;svg('rect',{x,y:35,width:68,height:65,rx:5,fill:'var(--panel-alt)',stroke:accent});label('['+i+']',x+23,58,true);label('Sound '+(i+1),x+9,84);label('key '+(i+1),x+16,121,true);}
   label('one loop loads five named files',95,152);caption='Array addresses start at 0. Number keys 1–5 choose sounds 0–4. Change the filenames and keep the loop.';
  }else if(kind==='ear'){
   [['Listen',22],['Mark',160],['Reveal',298]].forEach(([text,x],i)=>{svg('rect',{x,y:54,width:100,height:57,rx:5,fill:'var(--panel-alt)',stroke:i===2?amber:accent});label(text,x+25,88);if(i<2)label('→',x+111,88);});label('find the notes by listening first',87,146,true);caption='Use the live pitch slider. Listen, then Mark eight choices. Only the live sketch’s Reveal button shows the target positions.';
  }else if(kind==='ratios'){
   const base=diagram.base,ratios=C.RATIOS;
   svg('line',{x1:20,y1:95,x2:400,y2:95,stroke:border});
   ratios.forEach((ratio,i)=>{const x=20+(ratio-1)*380;svg('line',{x1:x,y1:76,x2:x,y2:112,stroke:i===0||i===7?accent:blue,'stroke-width':2});label(['DO','RE','MI','FA','SO','LA','TI','DO'][i],x-9,65,true);label(n(base*ratio),x-11,137,true);});
   label('base '+base+' Hz × ratio = frequency',79,28);caption='Class table: rounded ratios, with a 131 Hz tonic. Your worksheet asks you to invent your own ratios too.';
  }else if(kind==='threshold'){
   svg('rect',{x:20,y:48,width:380,height:35,rx:4,fill:'var(--panel-alt)',stroke:border});svg('rect',{x:20,y:48,width:380*C.clamp(diagram.level,0,1),height:35,fill:accent});const x=20+380*diagram.threshold;svg('line',{x1:x,y1:37,x2:x,y2:98,stroke:amber,'stroke-width':3});label('threshold '+n(diagram.threshold),20,125);label('practice level '+n(diagram.level),220,125);label('cross from below → change once',70,158);caption='The practice slider is simulated. The microphone path uses measured amplitude only after permission. Staying above the threshold does not choose a new color every frame.';
  }else if(kind==='spectrum'){
   svg('path',{d:wavePath(18,45,175,24,'sine',3),fill:'none',stroke:accent,'stroke-width':2});label('waveform: time',33,94,true);
   for(let i=0;i<12;i++){const bar=i===3?68:i===4?35:8;svg('rect',{x:225+i*14,y:80-bar,width:8,height:bar,fill:i===3?amber:blue});}label('spectrum: frequency bins',218,110,true);label('two views of one signal',88,151);caption='Illustration, not a microphone reading. The live p5 FFT sketch draws its actual waveform and bin values. New p5.sound bins use 0–1; legacy examples often use 0–255.';
  }else if(kind==='file'){
   label('sound-0.wav',18,27);svg('rect',{x:15,y:46,width:390,height:64,rx:4,fill:'var(--panel-alt)',stroke:border});svg('path',{d:wavePath(25,78,370,22,'sine',12,.8),fill:'none',stroke:accent,'stroke-width':1.5});svg('line',{x1:145,y1:40,x2:145,y2:119,stroke:amber,'stroke-width':2});label('play → pause → continue',74,150);caption='Loading prepares the file. Playing begins after your click. Pause keeps the playhead; Stop returns a file to its start.';
  }else if(kind==='timeline'){
   const segments=[['Listen',20,110],['Notice',150,105],['Explain',280,110]];segments.forEach(([name,x,w],i)=>{svg('rect',{x,y:56,width:w,height:54,rx:5,fill:'var(--panel-alt)',stroke:i===1?amber:accent});label(name,x+20,89);if(i<2)label('→',x+w+7,89);});label('26:00 → 1:14:00 · assigned panel',78,145,true);caption='Prepare the Week 10 discussion with your own listening notes. The 60-second algorithmic composition belongs to the next assignment.';
  }else{
   svg('line',{x1:15,y1:85,x2:405,y2:85,stroke:border});svg('path',{d:wavePath(15,85,390,47,diagram.wave,diagram.frequency*.014,C.clamp(diagram.volume,0,.1)/.1),fill:'none',stroke:accent,'stroke-width':2});label(n(diagram.frequency)+' Hz',20,25);label('gain '+n(diagram.volume)+' · '+diagram.wave,245,25,true);label('more cycles → higher pitch',20,153,true);caption='Frequency is cycles per second. Gain changes signal amplitude; waveform shape changes timbre. The pitch lesson’s p5 controls update this illustration.';
  }
  $('diagram-label').textContent='CONCEPT ILLUSTRATION';$('diagram-caption').textContent=caption;
 }
 function renderLine(reveal=true){
  line=Math.max(0,Math.min(lesson.lines.length-1,line));const entry=lesson.lines[line];$('line-count').textContent=(line+1)+' / '+lesson.lines.length;$('line-number').textContent='GUIDE LINE '+(line+1);$('selected-code').textContent=entry.code;$('line-meaning').textContent=entry.meaning;$('line-detail').textContent=entry.detail||'';$('line-select').value=String(line);$('previous-line').disabled=line===0;$('next-line').disabled=line===lesson.lines.length-1;drawRow(reveal);illustrate();remember();
 }
 function renderStep(){step=Math.max(0,Math.min(lesson.steps.length-1,step));const task=lesson.steps[step];$('practice-do').textContent=task.do;$('practice-notice').textContent='Notice: '+task.notice;$('practice-count').textContent=(step+1)+' / '+lesson.steps.length;$('previous-step').disabled=step===0;$('next-step').disabled=step===lesson.steps.length-1;remember();}
 function chooseLesson(id){
  const next=D.lessons.find(item=>item.id===id)||D.lessons[0];if(lesson?.id===next.id){showView('learn');return;}
  remember();releasePreview();lesson=next;store.lesson=next.id;const saved=store.positions[next.id]||{};line=saved.line||0;step=saved.step||0;diagram.frequency=next.id==='fft'?440:220;diagram.volume=.05;diagram.wave='sine';diagram.threshold=.1;diagram.level=0;diagram.base=131;
  $('lesson-count').textContent='LESSON '+(D.lessons.indexOf(next)+1)+' / '+D.lessons.length+' · WEEK 10';$('lesson-title').textContent=next.title;$('lesson-summary').textContent=next.summary;$('worksheet-tag').textContent=next.worksheet.length?'Worksheet '+next.worksheet.join(' + '):'Foundation / preparation';
  const prompts={unlock:'Press Play, then Stop. Watch the circle change.',single:'Press inside the canvas to play. Press again to pause.',bank:'Press a numbered button, or click inside the sketch then use keys 1–5.',pitch:'Press Play. Change one slider, then Stop.',scales:'Press buttons 1–8, or focus the sketch and use number keys.',mic:'Move Practice level first. Use microphone is optional and asks for your permission.',fft:'Press Play. Compare the spectrum bars with the waveform line.',ear:'Press Start. Move the pitch slider, listen, and Mark before Reveal.',prepare:'This rhythm example is silent. Watch the event pattern repeat.'};$('live-instructions').textContent=prompts[next.id];
  document.querySelectorAll('.lesson-link').forEach(a=>{if(a.dataset.lesson===id)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
  $('line-select').replaceChildren(...next.lines.map((entry,i)=>{const option=node('option',(i+1)+' · '+entry.code.trim());option.value=String(i);return option;}));
  const code=sourceOf(next);editor.value=store.drafts[id]??code;editor.maxLength=100000;$('lesson-note').value=store.notes[id]||'';$('undo-code').hidden=!undo.has(id);$('lesson-files').href='./lessons/'+id+'/files.zip';
  const words=D.foundations.filter(item=>item.lesson===id||next.concepts.includes(item.term));$('vocabulary').replaceChildren(...words.flatMap(item=>[node('dt',item.term),node('dd',item.meaning)]));
  const following=D.lessons[D.lessons.indexOf(next)+1];$('next-lesson-description').textContent=following?following.title:'Review your five worksheet links and class discussion notes.';$('next-lesson').textContent=following?'Continue →':'Open Worksheet →';$('next-lesson').onclick=()=>{location.hash=following?following.id:'worksheet';};
  showView('learn');renderLine();renderStep();if(editor.value===code)run();else{$('preview-status').textContent='Saved draft paused. Press Run when you are ready.';$('audio-status').textContent='Audio off';}
  document.title='Week 10 · '+next.title;persist();
 }
 function showView(name){
  if(!['learn','materials','worksheet','notes'].includes(name))return;if(name!=='learn')stopSound();currentView=name;
  for(const view of ['learn','materials','worksheet','notes'])$(view+'-view').hidden=view!==name;
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===name)));
  if(name==='notes')renderNotes();
 }
 function renderResources(filter='all'){
  const names={required:'Do this week',class:'Class code and materials',watch:'Watch and discuss',optional:'Optional foundations',reference:'Primary references'};const host=$('resource-list');host.replaceChildren();
  for(const [group,title]of Object.entries(names)){const items=D.resources.filter(item=>(item.group===group)&&(filter==='all'||filter===group));if(!items.length)continue;const section=node('section',undefined,'resource-group');section.append(node('h2',title));const grid=node('div',undefined,'resource-grid');for(const item of items){const card=node('article',undefined,'resource');const heading=node('h3');heading.append(link(item.title,item.url));card.append(node('span',item.kind.toUpperCase(),'tiny'),heading,node('p',item.summary));if(item.version||item.access)card.append(node('p',[item.version,item.access].filter(Boolean).join(' · '),'resource-meta'));if(item.lesson){const a=node('a','Practice this →');a.href='#'+item.lesson;card.append(a);}grid.append(card);}section.append(grid);host.append(section);}
 }
 function renderWorksheet(){
  $('worksheet-list').replaceChildren(...D.worksheet.map(task=>{const card=node('article',undefined,'worksheet-card'),body=node('div');card.append(node('span',String(task.number).padStart(2,'0'),'worksheet-number'),body);body.append(node('h2',task.title),node('p',task.deliverable));if(task.challenge)body.append(node('p','Challenge: '+task.challenge,'challenge'));const a=node('a','Open the guided practice →');a.href='#'+task.lesson;body.append(a);const label=node('label','My saved sketch / image link');label.htmlFor='worksheet-link-'+task.number;const input=node('input');input.id=label.htmlFor;input.type='url';input.placeholder='Paste your own saved link';input.value=store.links[task.number]||'';input.addEventListener('input',()=>{store.links[task.number]=input.value.slice(0,2000);persist();});body.append(label,input);return card;}));
  const checks=[['worksheet','I completed the worksheet tasks and posted my own links.'],['ear','I saved an image from my own best ear-training attempt.'],['upload','I uploaded the ear-training image through the class link.'],['panel','I watched the assigned Notes and Neurons window.'],['reflection','I prepared my own discussion notes about musical parameters.'],['repetition','I read / watched the speech-to-song repetition example.'],['article','I read the assigned article and/or watched the linked Amadeus scene.'],['solfege','I reviewed solfege / noise if I needed that background.']];
  $('checklist').replaceChildren(...checks.map(([id,text])=>{const label=node('label'),input=node('input');input.type='checkbox';input.checked=store.checks[id]===true;input.addEventListener('change',()=>{store.checks[id]=input.checked;persist();});label.append(input,node('span',text));return label;}));
 }
 function renderNotes(){const host=$('all-notes');host.replaceChildren(...D.lessons.map(item=>{const card=node('section',undefined,'panel');card.append(node('h2',item.title),node('p',store.notes[item.id]||'No observation saved yet.'));const a=node('a','Return to this lesson →');a.href='#'+item.id;card.append(a);return card;}));}
 function download(name,text,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type})),a=node('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function route(){const id=location.hash.slice(1);if(['materials','worksheet','notes'].includes(id)){if(!lesson)chooseLesson(store.lesson);showView(id);}else{const valid=C.IDS.includes(id)?id:store.lesson;if(!C.IDS.includes(id))history.replaceState(null,'','#'+valid);chooseLesson(valid);}}
 D.lessons.forEach((item,i)=>{const a=node('a',undefined,'lesson-link');a.href='#'+item.id;a.dataset.lesson=item.id;a.append(node('span',String(i+1).padStart(2,'0'),'lesson-digit'),node('span',item.title.split(',')[0]));$('lesson-nav').append(a);});
 document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{location.hash=button.dataset.view==='learn'?store.lesson:button.dataset.view;}));
 $('line-select').addEventListener('change',()=>{line=Number($('line-select').value);renderLine();});$('previous-line').onclick=()=>{line--;renderLine();};$('next-line').onclick=()=>{line++;renderLine();};$('previous-step').onclick=()=>{step--;renderStep();};$('next-step').onclick=()=>{step++;renderStep();};
 $('stop-all').onclick=stopSound;$('run-code').onclick=run;editor.addEventListener('scroll',()=>drawRow());
 editor.addEventListener('input',()=>{store.drafts[lesson.id]=editor.value;persist();drawRow();$('preview-status').textContent='Code edited. Press Run my code to try it.';});
 function followCaret(){if(editor.value===sourceOf(lesson)){line=editor.value.slice(0,editor.selectionStart).split('\n').length-1;renderLine(false);}}
 editor.addEventListener('click',followCaret);editor.addEventListener('keyup',followCaret);
 $('reset-code').onclick=()=>{if(editor.value!==sourceOf(lesson))undo.set(lesson.id,editor.value);editor.value=sourceOf(lesson);delete store.drafts[lesson.id];$('undo-code').hidden=!undo.has(lesson.id);persist();renderLine();run();};
 $('undo-code').onclick=()=>{if(!undo.has(lesson.id))return;releasePreview();editor.value=undo.get(lesson.id);store.drafts[lesson.id]=editor.value;undo.delete(lesson.id);$('undo-code').hidden=true;persist();drawRow();$('preview-status').textContent='Restored edit paused. Press Run when ready.';};
 $('lesson-note').addEventListener('input',()=>{store.notes[lesson.id]=$('lesson-note').value.slice(0,16000);persist();});
 $('download-code').onclick=()=>download('sketch.js',editor.value+'\n','text/javascript');$('copy-code').onclick=async()=>{try{await navigator.clipboard.writeText(editor.value);$('file-status').textContent='Your current code copied. Paste it into your own p5 sketch.';}catch{$('file-status').textContent='Copy is unavailable. Download sketch.js instead.';}};
 $('export-progress').onclick=()=>download('week10-learning-progress.json',JSON.stringify(store,null,2),'application/json');$('choose-import').onclick=()=>$('import-progress').click();
 $('download-notes').onclick=()=>download('week10-listening-notes.txt',D.lessons.map(item=>item.title+'\n'+(store.notes[item.id]||'[Add your own observation]')).join('\n\n')+'\n\nWORKSHEET LINKS\n'+D.worksheet.map(task=>task.number+'. '+task.title+'\n'+(store.links[task.number]||'[No link kept]')).join('\n\n'));
 $('import-progress').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>2000000)throw Error('Choose a progress file smaller than 2 MB.');pendingImport=C.normalize(JSON.parse(await file.text()));$('import-preview').textContent=Object.keys(pendingImport.notes).length+' notes, '+Object.keys(pendingImport.links).length+' links and '+Object.keys(pendingImport.drafts).length+' drafts. No file is uploaded.';$('import-dialog').showModal();}catch(error){$('transfer-status').textContent=error.message;pendingImport=null;}event.target.value='';});
 $('cancel-import').onclick=()=>{pendingImport=null;$('import-dialog').close();};$('confirm-import').onclick=()=>{if(!pendingImport)return;releasePreview();store=C.merge(store,pendingImport);pendingImport=null;lesson=null;persist();renderWorksheet();route();$('import-dialog').close();$('transfer-status').textContent='Progress merged in this browser. Reopened edited drafts remain paused.';};
 const groups=[['all','All materials'],['required','Required'],['class','Class code'],['watch','Watch / read'],['optional','Optional'],['reference','References']];groups.forEach(([id,text])=>{const b=node('button',text);b.dataset.filter=id;b.setAttribute('aria-pressed',String(id==='all'));b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));renderResources(id);};$('resource-filters').append(b);});
 const refs=[['Diagram Design','https://github.com/cathrynlavery/diagram-design','Accessible SVG, semantic diagrams, low density and clear playback.'],['Hallmark','https://github.com/Nutlope/hallmark','Consistent design tokens, focus, contrast and a working study-screen layout.'],['Waza','https://github.com/tw93/Waza','Scoped review and evidence-based completion checks.']];refs.forEach(([name,url,why])=>{const p=node('p');p.append(link(name,url),document.createTextNode(' · '+why));$('design-references').append(p);});
 window.addEventListener('message',event=>{
  const data=event.data;if(!token||event.source!==frame.contentWindow||event.origin!==location.origin||data?.token!==token)return;
  if(data.kind==='ready')$('preview-status').textContent='p5 '+data.p5+' ready · '+data.width+' × '+data.height;
  if(data.kind==='error'){$('preview-status').textContent=String(data.message);$('preview-status').classList.add('error');}
  if(data.kind==='audio')$('audio-status').textContent=data.state==='running'?'Audio enabled':data.state==='suspended'?'Audio off · use sketch controls':'Audio stopped · Run to prepare';
  if(data.kind==='control'){
   if(data.name==='Frequency')diagram.frequency=C.clamp(data.value,20,2000,220);if(data.name==='Volume')diagram.volume=C.clamp(data.value,0,.1,.05);if(data.name==='Waveform'&&['sine','triangle','square','sawtooth'].includes(data.value))diagram.wave=data.value;
   if(data.name==='Threshold')diagram.threshold=C.clamp(data.value,0,1,.1);if(data.name==='Practice level')diagram.level=C.clamp(data.value,0,1,0);if(data.name==='Ear pitch')diagram.ear=C.clamp(data.value,0,1,0);illustrate();
  }
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound();});window.addEventListener('pagehide',releasePreview);window.addEventListener('hashchange',route);
 renderResources();renderWorksheet();route();
})();
