const test=require('node:test'),assert=require('node:assert/strict');
function illustrations(){return require('./illustrations.js');}
test('every lesson has a bounded, silent interactive model with a meaningful result',()=>{
 const I=illustrations();for(const id of require('./core').IDS){const m=I.model(id,I.initial(id));assert(m.title&&m.caption&&m.formula);assert(m.controls.length>0,id);assert(m.metrics.length>0,id);assert.equal(m.id,id);assert(!m.controls.some(c=>c.action==='microphone'||c.action==='audio'));}
});
test('loop model visits five zero-based file slots then stops without inventing a sixth',()=>{
 const I=illustrations();for(let i=0;i<5;i++){const m=I.model('bank',{index:i});assert.equal(m.data.active,i);assert(m.formula.includes('sound-'+i+'.wav'));assert(m.formula.includes(String(i+1)));}const end=I.model('bank',{index:5});assert.equal(end.data.active,-1);assert(end.formula.includes('false'));assert(!end.formula.includes('sound-5.wav'));
});
test('ratio math uses the supplied table and bounds the selected position',()=>{
 const I=illustrations(),m=I.model('scales',{base:131,note:3});assert.equal(m.data.frequency,175.54);assert.equal(I.model('scales',{base:131,note:99}).data.frequency,262);
});
test('threshold distinguishes remaining above from a new upward crossing',()=>{
 const I=illustrations();assert.equal(I.model('mic',{level:.2,threshold:.1,previousAbove:false}).data.crossing,true);assert.equal(I.model('mic',{level:.2,threshold:.1,previousAbove:true}).data.crossing,false);assert.equal(I.model('mic',{level:.05,threshold:.1,previousAbove:true}).data.above,false);
});
test('FFT axes are derived from sample rate and no ear targets appear before practice',()=>{
 const I=illustrations();assert.equal(I.model('fft',{sampleRate:48000}).data.binHz,93.75);assert.equal(I.model('fft',{sampleRate:44100}).data.range,2756.25);const ear=I.model('ear',{phase:2});assert(!ear.formula.includes('1.34'));assert(!ear.data.targets);
});
test('FFT model draws 32 bins and a changing pure tone selects its nearest bin center',()=>{
 const I=illustrations(),host={children:[],setAttribute(){},replaceChildren(){this.children=[];},append(el){this.children.push(el);},ownerDocument:{createElementNS(_,tag){return {tag,attrs:{},setAttribute(k,v){this.attrs[k]=v;}};}}};
 I.draw(host,I.model('fft',{sampleRate:48000,frequency:440}));assert.equal(host.children.filter(e=>e.tag==='rect').length,32);assert.equal(Number(host.children.find(e=>e.tag==='rect'&&e.attrs.fill==='var(--amber)').attrs.x),237.5);
 I.draw(host,I.model('fft',{sampleRate:48000,frequency:530}));assert.equal(Number(host.children.find(e=>e.tag==='rect'&&e.attrs.fill==='var(--amber)').attrs.x),243);
});
