const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const runtime=require('./runtime.js');
test('learner source cannot break out of the iframe script element',()=>{
 const code='const sample = "</script><img src=x onerror=alert(1)>";';
 const html=runtime.frameHTML({code,token:'proof'});
 assert(!html.includes('<img src=x'));assert(html.includes('\\u003c/script>'));
 assert(html.includes('./vendor/p5.min.js'));assert(html.includes('./vendor/p5.sound.min.js'));assert(html.includes('<base href="./">'));
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,2);scripts.forEach(match=>assert.doesNotThrow(()=>new vm.Script(match[1])));
});
function observerHarness(){
 const events={},messages=[],nodes=[],context={state:'suspended',closed:0,close(){this.closed++;this.state='closed';return Promise.resolve();}},doc={baseURI:'https://example.test/week10/',hidden:false,createElement(){return {setAttribute(){},isConnected:false};},querySelector(selector){return selector==='canvas'?{width:480,height:220}:null;},querySelectorAll(){return nodes;},addEventListener(kind,fn){events['doc:'+kind]=fn;},body:{append(n){n.isConnected=true;}}};
 let tick,resolveMedia,calls=0;const media={getUserMedia(){calls++;return new Promise(resolve=>resolveMedia=resolve);}},win={frameCount:1,p5:{VERSION:'2.3.4'},addEventListener(kind,fn){events[kind]=fn;}};
 vm.runInNewContext('('+runtime.observe.toString()+')("proof")',{window:win,document:doc,URL,location:{origin:'null'},navigator:{mediaDevices:media},parent:{postMessage(data,origin){messages.push({data,origin});}},p5:win.p5,getAudioContext:()=>context,setInterval(fn){tick=fn;return 1;},clearInterval(){},console});
 return {win,doc,events,messages,context,media,tick:()=>tick(),calls:()=>calls,resolveMedia:stream=>resolveMedia(stream)};
}
test('srcdoc readiness reports to inherited document origin without starting audio or mic',()=>{
 const h=observerHarness();assert.equal(h.calls(),0);assert.equal(h.context.state,'suspended');h.tick();
 assert(h.messages.some(m=>m.data.kind==='ready'&&m.origin==='https://example.test'));assert(!h.messages.some(m=>m.origin==='null'));assert.equal(h.calls(),0);
});
test('readiness waits for the first draw after asynchronous setup',()=>{
 const h=observerHarness();h.win.frameCount=0;h.tick();assert(!h.messages.some(m=>m.data.kind==='ready'));
 h.win.frameCount=1;h.tick();assert(h.messages.some(m=>m.data.kind==='ready'));
});
test('a ready preview reports content height only when it changes',()=>{
 const h=observerHarness();h.doc.body.scrollHeight=295;h.tick();h.tick();assert.equal(h.messages.filter(m=>m.data.kind==='layout').length,1);assert.equal(h.messages.find(m=>m.data.kind==='layout').data.height,295);h.doc.body.scrollHeight=370;h.tick();assert.equal(h.messages.filter(m=>m.data.kind==='layout').at(-1).data.height,370);
});
test('readiness reports logical sketch dimensions rather than high-density backing pixels',()=>{
 const h=observerHarness();h.win.width=240;h.win.height=110;h.tick();const ready=h.messages.find(m=>m.data.kind==='ready').data;assert.equal(ready.width,240);assert.equal(ready.height,110);
});
test('a stopped frame blocks canvas/key handlers and new microphone requests',async()=>{
 const h=observerHarness();h.win.soundPreview.stop();
 for(const kind of ['mousedown','touchstart','click','keydown','keyup']){let blocked=0,prevented=0;h.events[kind]?.({stopImmediatePropagation(){blocked++;},preventDefault(){prevented++;}});assert.equal(blocked,1,kind);assert.equal(prevented,1,kind);}
 await assert.rejects(h.media.getUserMedia({audio:true}),/stopped/i);assert.equal(h.calls(),0);
});
test('stopping a frame preserves native Tab navigation out of it',()=>{
 const h=observerHarness();h.win.soundPreview.stop();let prevented=0,blocked=0;h.events.keydown({key:'Tab',preventDefault(){prevented++;},stopImmediatePropagation(){blocked++;}});assert.equal(prevented,0);assert.equal(blocked,1);
});
test('an intentionally stopped loading frame never reports a loading timeout',()=>{
 const h=observerHarness();h.win.frameCount=0;h.win.soundPreview.stop();for(let i=0;i<170;i++)h.tick();assert(!h.messages.some(m=>m.data.kind==='error'||m.data.kind==='ready'));
});
test('late rejection after intentional Stop does not replace its stopped status with a sketch error',()=>{
 const h=observerHarness();h.win.soundPreview.stop();h.events.unhandledrejection({reason:Error('context closed by Stop')});assert(!h.messages.some(m=>m.data.kind==='error'));
});
test('Stop all cancels a late microphone grant and active streams on page hiding',async()=>{
 const h=observerHarness(),track={stops:0,stop(){this.stops++;}},pending=h.media.getUserMedia({audio:true});
 h.win.soundPreview.stop();h.resolveMedia({getTracks:()=>[track]});await pending;assert.equal(track.stops,1);
 const h2=observerHarness(),activeTrack={stops:0,stop(){this.stops++;}},active=h2.media.getUserMedia({audio:true});h2.resolveMedia({getTracks:()=>[activeTrack]});await active;
 h2.doc.hidden=true;h2.events['doc:visibilitychange']();assert.equal(activeTrack.stops,1);assert.equal(h2.context.state,'closed');
});
