(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./core.js'));else root.SoundIllustrations=factory(root.SoundCore);})(typeof window==='object'?window:this,function(C){
 'use strict';
 const names=['DO','RE','MI','FA','SO','LA','TI','DO'];
 function initial(id){return {phase:0,index:0,head:.3,frequency:id==='fft'?440:220,volume:.05,wave:'sine',base:131,note:0,level:0,threshold:.1,previousAbove:false,sampleRate:48000,time:0};}
 const range=(key,label,min,max,step,value)=>({key,label,type:'range',min,max,step,value});
 const select=(key,label,options,value)=>({key,label,type:'select',options,value});
 const number=(x,min,max,fallback)=>C.clamp(x,min,max,fallback);
 function model(id,patch={}){
  const s={...initial(id),...patch},m={id,title:'',caption:'',formula:'',controls:[],metrics:[],data:{}};
  const frequency=number(s.frequency,110,id==='fft'?2000:880,220),gain=number(s.volume,0,.06,.05),phase=Math.floor(number(s.phase,0,3,0));
  if(id==='unlock'){
   const labels=['Prepare','Click Play','Enable audio','Start + draw'];m.title='A click connects the steps';m.controls=[select('phase','Explore a moment',labels,phase)];m.data={phase,labels};m.formula=['setup() prepares the oscillator; playing = false','The click calls playTone()','await waits here; it does not pause the whole page','osc.start(); playing = true; draw() shows the state'][phase];m.metrics=['Run prepares','Play is an event','draw repeats'];m.caption='A silent timeline. Audio activation is separate from microphone permission. Defining a function does not run it.';
  }else if(id==='single'){
   const head=number(s.head,0,1,.3),mode=Math.min(2,phase),labels=['Ready','Playing','Paused'];m.title='A file has a position and a state';m.controls=[select('phase','File state',labels,mode),range('head','Explore playhead',0,1,.01,head)];m.data={head,phase:mode,labels};m.formula=mode===2?'pause() keeps this position; play() continues':mode===1?'play() begins or resumes; loop() configures repetition':'await loadSound() prepares the file; it does not press Play';m.metrics=['Position '+Math.round(head*100)+'%','State: '+labels[mode]];m.caption='Silent model of a playhead. In real p5, press the canvas twice to play and pause. This slider is not the live file position.';
  }else if(id==='bank'){
   const i=Math.floor(number(s.index,0,5,0)),running=i<5;m.title='One loop visits five list positions';m.controls=[range('index','Loop counter i',0,5,1,i)];m.data={index:i,active:running?i:-1};m.formula=running?'i = '+i+'; '+i+' < 5 → true; sounds['+i+'] ← sound-'+i+'.wav; button '+(i+1):'i = 5; 5 < 5 → false; stop the loop';m.metrics=running?['Index '+i,'File sound-'+i+'.wav','Key '+(i+1)]:['All five entries loaded','No sixth entry'];m.caption='Move i one step at a time. A list position starts at zero; the button label starts at one. This models loading, not sound playback.';
  }else if(id==='pitch'){
   const wave=['sine','triangle','square','sawtooth'].includes(s.wave)?s.wave:'sine';m.title='Change one property at a time';m.controls=[range('frequency','Model frequency (Hz)',110,880,1,frequency),range('volume','Model gain',0,.06,.005,gain),select('wave','Model waveform',['sine','triangle','square','sawtooth'],wave)];m.data={frequency,gain,wave};m.formula=frequency+' Hz = '+frequency+' cycles each second';m.metrics=['Pitch ← frequency','Level ← gain','Timbre ← shape'];m.caption='Silent model, not measured audio. These controls change this diagram. Moving the real p5 sliders also updates it. Use p5 Play for sound.';
  }else if(id==='scales'){
   const base=number(s.base,65,262,131),note=Math.floor(number(s.note,0,7,0)),ratio=C.RATIOS[note],hz=C.frequency(base,ratio);m.title='A ratio multiplies a reference note';m.controls=[range('base','Model tonic (Hz)',65,262,1,base),select('note','Choose a class note',names.map((n,i)=>(i+1)+' · '+n),note)];m.data={base,note,ratio,frequency:hz};m.formula=base+' × '+ratio+' = '+hz+' Hz';m.metrics=['Note '+(note+1)+' · '+names[note],'Ratio '+ratio,'Octave = ×2'];m.caption='Class reference table, using its rounded ratios. Change the ratios in your code to invent a scale; this reference table stays fixed.';
  }else if(id==='mic'){
   const level=number(s.level,0,1,0),threshold=number(s.threshold,0,.5,.1),above=level>threshold,crossing=!s.previousAbove&&above;m.title='Turn a changing level into a decision';m.controls=[range('level','Model level',0,1,.01,level),range('threshold','Model threshold',0,.5,.01,threshold)];m.data={level,threshold,above,crossing};m.formula=level.toFixed(2)+' > '+threshold.toFixed(2)+' → '+above+(crossing?' · new upward crossing':' · no new upward crossing');m.metrics=['Level is '+(above?'above':'at/below'),'Change color: '+(crossing?'once now':'no new crossing')];m.caption='Simulated signal. One color per upward crossing is our anti-flicker choice. The worksheet asks for a color change above a threshold. Real microphone levels stay in the p5 preview.';
  }else if(id==='fft'){
   const sampleRate=number(s.sampleRate,8000,192000,48000),binHz=sampleRate/(2*256);m.title='Time samples and frequency bins';m.controls=[range('frequency','Model frequency (Hz)',110,2000,1,frequency),select('sampleRate','Example sample rate',[44100,48000],sampleRate===44100?0:1)];m.data={frequency,sampleRate,binHz,range:binHz*32};m.formula=sampleRate+' / (2 × 256) = '+Number(binHz.toFixed(3))+' Hz per bin';m.metrics=['First 32 of 256 bins','View: 0–'+Number((binHz*32).toFixed(1))+' Hz','Heights = relative strength'];m.caption='Pure-tone model highlighting the nearest bin center, not analyzer output. Real signals can spread into neighboring bins. The real p5 plot reads measured data, labels its sample-rate-based frequency window, and magnifies the drawing ×20 while audio stays quiet.';
  }else if(id==='ear'){
   const p=Math.min(2,phase),labels=['Listen','Mark','Reveal'];m.title='Listen before showing the answers';m.controls=[select('phase','Explore the practice order',labels,p)];m.data={phase:p,labels};m.formula=['Fixed tonic + moving pitch → hear their relationship','Record your own eight choices before Reveal','Compare afterward; use the official tool for the class image'][p];m.metrics=['Reference stays at 235 Hz','Moving note: 235–470 Hz'];m.caption='No answer positions are shown here. In the official class tool: move the mouse, click to mark, Return to reveal, Tab to save. Your practice result is not a completed class submission.';
  }else{
   const time=Math.floor(number(s.time,0,7,0)),pattern=[1,0,1,0,1,1,0,0];m.id='prepare';m.title='A pattern unfolds one step at a time';m.controls=[range('time','Explore the pattern step',0,7,1,time)];m.data={time,pattern};m.formula='pattern['+time+'] = '+pattern[time]+' → '+(pattern[time]?'event':'rest');m.metrics=['8 positions × 350 ms = 2.8 s','0 is a rest; 1 is an event'];m.caption='A silent timing model. Your p5 example animates this pattern. Read, listen and bring your own observations; the 60-second composition belongs to Week 11.';
  }
  return m;
 }
 function draw(host,m){
  const doc=host.ownerDocument||document,accent='var(--accent)',amber='var(--amber)',blue='var(--blue)',border='var(--border)',panel='var(--panel-alt)';host.replaceChildren();host.setAttribute('viewBox','0 0 400 180');
  const add=(tag,attrs,text)=>{const e=doc.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));if(text!==undefined)e.textContent=text;host.append(e);return e;};
  add('title',{id:'concept-title'},m.title);add('desc',{},m.caption);
  const text=(v,x,y,size=15)=>add('text',{x,y,'font-size':size,'text-anchor':'middle'},v),line=(x1,y1,x2,y2,c=border)=>add('line',{x1,y1,x2,y2,stroke:c,'stroke-width':2}),box=(x,y,w,h,active)=>add('rect',{x,y,width:w,height:h,rx:5,fill:active?'var(--diagram-active)':panel,stroke:active?accent:border,'stroke-width':active?2:1});
  const path=(x,y,w,h,type,cycles,gain)=>Array.from({length:201},(_,i)=>(i?'L':'M')+(x+w*i/200).toFixed(2)+' '+(y-C.wave(type,i/200*cycles)*h*gain).toFixed(2)).join(' ');
  const d=m.data;
  if(m.id==='unlock'){
   const lines=[['setup()','prepare'],['Play','event'],['await','wait here'],['start()','then draw']];lines.forEach((a,i)=>{const x=5+i*100;box(x,45,88,78,i===d.phase);text(a[0],x+44,77,16);text(a[1],x+44,105,13);if(i<3)text('→',x+94,88,15);});text('Prepare once · react later · draw repeatedly',200,158,14);
  }else if(m.id==='single'){
   box(10,45,380,72,false);add('path',{d:path(20,81,360,23,'sine',11,.8),fill:'none',stroke:accent,'stroke-width':2});line(20+d.head*360,33,20+d.head*360,127,amber);text(d.labels[d.phase],200,26,16);text('start',30,154,14);text('end',372,154,14);
  }else if(m.id==='bank'){
   for(let i=0;i<5;i++){const x=5+i*79;box(x,40,72,75,d.active===i);text('['+i+']',x+36,72,20);text('key '+(i+1),x+36,100,14);}text(d.active<0?'i = 5 → stop':'i = '+d.index+' → visit this position',200,155,16);
  }else if(m.id==='pitch'){
   line(12,88,388,88);add('path',{d:path(12,88,376,53,d.wave,d.frequency/110,d.gain/.06),fill:'none',stroke:accent,'stroke-width':2.5});text(d.frequency+' Hz',200,20,17);text('same short time window →',200,168,14);
  }else if(m.id==='scales'){
   line(16,99,384,99);C.RATIOS.forEach((r,i)=>{const x=16+(r-1)*368;line(x,82,x,115,i===d.note?amber:border);text(names[i],x,65,i===d.note?17:14);if(i===d.note)add('circle',{cx:x,cy:99,r:6,fill:accent});});text('×1',20,145,15);text('×2',380,145,15);text('one octave',200,160,16);
  }else if(m.id==='mic'){
   box(15,53,370,43,false);add('rect',{x:15,y:53,width:d.level*370,height:43,rx:4,fill:accent});line(15+d.threshold*370,35,15+d.threshold*370,115,amber);text('level',55,143,15);text('threshold boundary',265,143,15);text(d.above?'above':'below / equal',200,24,17);
  }else if(m.id==='fft'){
   add('path',{d:path(10,75,165,35,'sine',d.frequency/220,.8),fill:'none',stroke:accent,'stroke-width':2});line(10,115,175,115);text('time →',90,145,15);const selected=Math.min(31,Math.round(d.frequency/d.binHz));for(let i=0;i<32;i++){const h=i===selected?80:Math.abs(i-selected)===1?28:4;add('rect',{x:210+i*5.5,y:114-h,width:4,height:h,fill:i===selected?amber:blue});}text('frequency →',298,145,15);text('waveform',90,22,16);text('spectrum',298,22,16);
  }else if(m.id==='ear'){
   d.labels.forEach((label,i)=>{const x=10+i*132;box(x,50,115,70,i===d.phase);text(label,x+57.5,91,17);if(i<2)text('→',x+123,91,15);});text('Keep target positions hidden until Reveal',200,157,14);
  }else{
   d.pattern.forEach((event,i)=>{const x=25+i*50;add('circle',{cx:x,cy:80,r:event?15:5,fill:i===d.time?amber:accent});if(i===d.time)add('circle',{cx:x,cy:80,r:22,fill:'none',stroke:amber,'stroke-width':2});text(i,x,130,15);});text('index',200,164,14);
  }
 }
 return {initial,model,draw};
});
