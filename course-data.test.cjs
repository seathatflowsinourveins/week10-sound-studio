const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const filename = path.join(__dirname, 'course-data.js');

function course() {
  assert.ok(fs.existsSync(filename), 'course-data.js must provide the complete learning course');
  return require(filename);
}
function source(lesson) { return lesson.lines.map(line => line.code).join('\n'); }

// Browser audio is the external boundary. These doubles record what the real
// sketch asks it to do; they do not claim that an audio device actually played.
function sketch(lesson, { deferMicrophone = false } = {}) {
  const effects = [], controls = [], files = [], sources = [], descriptions = [];
  class Source {
    constructor(...args) { this.args = args; this.playing = false; this.node = { state: 'stopped' }; sources.push(this); }
    amp(n) { assert.ok(n >= 0 && n <= 0.06, 'example gain must remain quiet'); effects.push(['gain', n]); }
    freq(n) { this.frequency = n; effects.push(['frequency', n]); }
    setType(type) { effects.push(['waveform', type]); }
    start() { this.playing = true; this.node.state = 'started'; effects.push(['start']); }
    stop() { this.playing = false; this.node.state = 'stopped'; effects.push(['stop']); }
    play() { this.playing = true; effects.push(['play']); }
    pause() { this.playing = false; effects.push(['pause']); }
    isPlaying() { return this.playing; }
    loop() {}
    disconnect() { effects.push(['disconnect']); }
    connect(target) { assert.ok(target); effects.push(['connect']); }
  }
  class AudioIn extends Source {
    start() { effects.push(['microphone-request']); if (!deferMicrophone) this.node.state = 'started'; }
  }
  // Execute the pinned p5.Element methods: mousePressed uses pointerdown,
  // while native Enter/Space button activation dispatches a click event.
  const vendor = fs.readFileSync(path.join(__dirname, 'vendor/p5.min.js'), 'utf8');
  const methods = {};
  for (const [name, next] of [['mousePressed', 'doubleClicked'], ['mouseClicked', 'mouseMoved']]) {
    const start = vendor.indexOf(`${name}(e){`), end = vendor.indexOf(`${next}(e){`, start);
    assert.ok(start >= 0 && end > start, `pinned p5 ${name} implementation`);
    methods[name] = vm.runInNewContext(`({${vendor.slice(start, end)}})`, {
      En: { _adjustListener(type, fn, control) { control.callbacks[type] = fn; } }
    })[name];
  }
  function element(label, value) {
    const control = { label, current: value, callbacks: {},
      _pInst: { _activePointers: new Map(), _setMouseButton() {}, _updatePointerCoords() {} },
      value(n) { if (n !== undefined) this.current = n; return this.current; },
      ...methods,
      input(fn) { this.callbacks.input = fn; return this; },
      changed(fn) { this.callbacks.change = fn; return this; },
      option(value) { if (this.current === undefined) this.current = value; return this; },
      selected(value) { this.current = value; return this; },
      attribute() { return this; }, html(value) { this.text = value; return this; }
    };
    controls.push(control); return control;
  }
  const ctx = {
    p5: { Oscillator: Source, AudioIn, Amplitude: class { getLevel() { return 0.2; } },
      FFT: class { analyze() { return [0, 0.2, 0.5, 1]; } waveform() { return [-1, 0, 1, 0]; } } },
    createCanvas(w, h) { ctx.width = w; ctx.height = h; return element('canvas'); },
    createButton: label => element(label), createSlider: (min, max, value) => element('slider', value),
    createSelect: () => element('select'), createP: label => element(label),
    loadSound: async name => { files.push(name); return new Source(); },
    userStartAudio: () => { effects.push(['unlock']); },
    background() {}, fill() {}, noFill() {}, noStroke() {}, stroke() {}, strokeWeight() {},
    text() {}, textSize() {}, textAlign() {}, line() {}, circle() {}, ellipse() {}, rect() {},
    beginShape() {}, endShape() {}, vertex() {}, describe: value => descriptions.push(value), getAudioContext:()=>({sampleRate:48000,resume:async()=>{effects.push(['unlock']);}}),
    saveCanvas: (...args) => effects.push(['save', ...args]),
    map: (n, a, b, c, d) => c + (n - a) / (b - a) * (d - c),
    constrain: (n, min, max) => Math.max(min, Math.min(max, n)),
    sin: Math.sin, abs: Math.abs, floor: Math.floor, round: Math.round,
    random: max => max / 2, nf: (n, left, right = 0) => Number(n).toFixed(right),
    TWO_PI: Math.PI * 2, CENTER: 'center', width: 480, height: 220,
    mouseX: 240, mouseY: 100, key: '', frameCount: 1, console,
    millis: () => 1000, document: { activeElement: { tagName: 'BODY' } }
  };
  vm.createContext(ctx); new vm.Script(source(lesson), { filename: `${lesson.id}.js` }).runInContext(ctx);
  return { ctx, effects, controls, files, sources, descriptions };
}

function button(run, label) { return run.controls.find(control => control.label === label); }
function activate(run, label) {
  const control = button(run, label);
  assert.ok(control, `button: ${label}`);
  const handler = control.callbacks.click || control.callbacks.pointerdown;
  return handler.call(control, { pointerId: 1, target: { tagName: 'BUTTON' } });
}
function holdResume(run) {
  const waits = [];
  run.ctx.getAudioContext = () => ({ sampleRate: 48000, resume: () => new Promise((resolve, reject) => waits.push({ resolve, reject })) });
  return waits;
}

test('all lesson programs compile and supply an explanation for every displayed line', () => {
  const { lessons } = course();
  assert.deepEqual(lessons.map(x => x.id), ['unlock', 'single', 'bank', 'pitch', 'scales', 'mic', 'fft', 'ear', 'prepare']);
  for (const lesson of lessons) {
    assert.ok(lesson.title && lesson.summary && lesson.steps.length && lesson.concepts.length, lesson.id);
    assert.ok(lesson.lines.length > 8, `${lesson.id}: complete program`);
    for (const line of lesson.lines) assert.ok(line.code.trim() && line.meaning.trim(), `${lesson.id}: unexplained line`);
    assert.doesNotThrow(() => new vm.Script(source(lesson)), lesson.id);
  }
});

test('browser and CommonJS consumers receive the same course interface', () => {
  const exported = course(); const browser = { window: {} };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), browser);
  assert.deepEqual(Object.keys(browser.window.soundCourse).sort(), Object.keys(exported).sort());
  assert.equal(browser.window.soundCourse.lessons.length, 9);
});

test('each sketch stays silent and makes no microphone request through setup and draw', async () => {
  for (const lesson of course().lessons) {
    const run = sketch(lesson);
    await run.ctx.setup();
    run.ctx.draw(); run.ctx.draw();
    assert.deepEqual(run.effects.filter(x => ['start', 'play', 'unlock', 'microphone-request'].includes(x[0])), [], lesson.id);
    assert.equal(run.ctx.width, 480); assert.equal(run.ctx.height, 220);
  }
});

test('pinned p5 describe updates fallback text only when the description changes', () => {
  const vendor = fs.readFileSync(path.join(__dirname, 'vendor/p5.min.js'), 'utf8');
  const start = vendor.indexOf('t.describe=function'), helper = vendor.lastIndexOf('function l(e){', start);
  const end = vendor.indexOf(',t.describeElement=', start);
  assert.ok(helper >= 0 && end > start, 'pinned describe implementation and punctuation helper');
  const describe = vm.runInNewContext(`${vendor.slice(helper, end)}; t.describe`, { t: {} });
  const changes = [], fallback = { text: '', get innerHTML() { return this.text; }, set innerHTML(value) { this.text = value; changes.push(value); } };
  const instance = { canvas: { id: 'preview' }, dummyDOM: {}, descriptions: { fallback }, LABEL: 'label' };
  describe.call(instance, 'The tone is stopped.'); describe.call(instance, 'The tone is stopped.');
  describe.call(instance, 'A tone is playing.'); describe.call(instance, 'A tone is playing.');
  assert.deepEqual(changes, ['The tone is stopped.', 'A tone is playing.']);
});

test('every lesson supplies an accessible canvas description while initially silent', async () => {
  for (const lesson of course().lessons) {
    const run = sketch(lesson); await run.ctx.setup(); run.ctx.draw();
    assert.ok(run.descriptions.at(-1)?.trim(), `${lesson.id}: canvas description`);
  }
});
test('stopping a pending microphone request keeps its unresolved state accessible without level announcements',async()=>{
 const run=sketch(course().lessons.find(x=>x.id==='mic'));let resume;run.ctx.getAudioContext=()=>({resume:()=>new Promise(resolve=>resume=resolve)});await run.ctx.setup();const request=run.controls.find(x=>x.label==='Use microphone').callbacks.click();run.controls.find(x=>x.label==='Stop microphone / practice').callbacks.click();run.ctx.draw();const text=run.descriptions.at(-1);assert.match(text,/Practice/);assert.match(text,/pending/i);assert(!/Level:/.test(text));resume();await request;
});

test('first lesson describes actual playback through waiting, cancellation, playing and Stop', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'unlock'));
  await run.ctx.setup(); run.ctx.draw();
  assert.equal(run.descriptions.at(-1), 'The tone is stopped.');
  const waits = holdResume(run), canceled = activate(run, 'Play'); run.ctx.draw();
  assert.equal(run.descriptions.at(-1), 'The tone is stopped.');
  await activate(run, 'Stop'); waits[0].resolve(); await canceled; run.ctx.draw();
  assert.equal(run.descriptions.at(-1), 'The tone is stopped.');
  const playing = activate(run, 'Play'); waits[1].resolve(); await playing; run.ctx.draw();
  assert.equal(run.descriptions.at(-1), 'A tone is playing.');
  await activate(run, 'Stop'); run.ctx.draw();
  assert.equal(run.descriptions.at(-1), 'The tone is stopped.');
});

test('single-file mouse press plays then pauses after the awaited file load', async () => {
  const run = sketch(course().lessons.find(x => x.id === 'single'));
  await run.ctx.setup();
  assert.deepEqual(run.files, ['sound-0.wav']);
  await run.ctx.mousePressed(); await run.ctx.mousePressed();
  assert.deepEqual(run.effects.filter(x => ['play', 'pause'].includes(x[0])), [['play'], ['pause']]);
});
test('the gesture handler waits for actual AudioContext readiness before starting a source',async()=>{
 const run=sketch(course().lessons.find(x=>x.id==='unlock'));let ready;run.ctx.getAudioContext=()=>({resume:()=>new Promise(resolve=>ready=resolve)});await run.ctx.setup();const playing=activate(run, 'Play');await Promise.resolve();assert.equal(run.effects.filter(x=>x[0]==='start').length,0);assert.equal(typeof ready,'function');ready();await playing;assert.equal(run.effects.filter(x=>x[0]==='start').length,1);
});
test('a rejected audio activation never starts the oscillator',async()=>{
 const run=sketch(course().lessons.find(x=>x.id==='unlock'));run.ctx.getAudioContext=()=>({resume:()=>Promise.reject(Error('activation denied'))});await run.ctx.setup();await assert.rejects(activate(run, 'Play'),/activation denied/);assert.equal(run.effects.filter(x=>x[0]==='start').length,0);
});

for (const [id, play, stop] of [
  ['unlock', 'Play', 'Stop'], ['pitch', 'Play', 'Stop'], ['fft', 'Play', 'Stop'],
  ['ear', 'Start', 'Stop'], ['bank', '1', 'Stop all'], ['scales', '1', 'Stop'],
  ['mic', 'Use microphone', 'Stop microphone / practice']
]) {
  test(`${id}: Stop cancels a start waiting for audio activation`, async () => {
    const run = sketch(course().lessons.find(lesson => lesson.id === id));
    await run.ctx.setup();
    const waits = holdResume(run), starting = activate(run, play);
    assert.equal(waits.length, 1);
    await activate(run, stop);
    waits[0].resolve(); await starting; run.ctx.draw();
    assert.deepEqual(run.effects.filter(effect => ['start', 'play', 'microphone-request'].includes(effect[0])), []);
  });
}

test('all lesson buttons respond to the pinned semantic click event used by Enter and Space', async () => {
  for (const lesson of course().lessons) {
    const run = sketch(lesson); await run.ctx.setup();
    const buttons = run.controls.filter(control => !['canvas', 'slider', 'select'].includes(control.label));
    for (const control of buttons) assert.equal(typeof control.callbacks.click, 'function', `${lesson.id}: ${control.label}`);
  }
  const run = sketch(course().lessons.find(lesson => lesson.id === 'unlock'));
  await run.ctx.setup(); await button(run, 'Play').callbacks.click();
  assert.equal(run.effects.filter(effect => effect[0] === 'start').length, 1);
  button(run, 'Stop').callbacks.click();
  assert.equal(run.sources[0].playing, false);
});

test('single-file rapid play / pause follows the latest intent before audio is ready', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'single'));
  await run.ctx.setup(); const waits = holdResume(run);
  const first = run.ctx.mousePressed(), second = run.ctx.mousePressed();
  waits.forEach(wait => wait.resolve()); await Promise.all([first, second]);
  assert.equal(run.effects.filter(effect => effect[0] === 'play').length, 0);
  const third = run.ctx.mousePressed(); waits.at(-1).resolve(); await third;
  assert.equal(run.sources[0].playing, true);
});

test('single-file button activates once without also triggering the canvas handler', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'single'));
  await run.ctx.setup();
  await run.ctx.mousePressed({ target: { tagName: 'BUTTON' } });
  assert.equal(run.effects.filter(effect => effect[0] === 'play').length, 0);
  await activate(run, 'Play / pause');
  assert.equal(run.effects.filter(effect => effect[0] === 'play').length, 1);
  run.ctx.mouseX = -1; await run.ctx.mousePressed({ target: { tagName: 'CANVAS' } });
  assert.equal(run.sources[0].playing, true);
});

test('single-file rejected activation returns to paused intent and allows the next click to play', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'single')), labels = [];
  run.ctx.text = value => labels.push(value); await run.ctx.setup();
  const waits = holdResume(run), first = activate(run, 'Play / pause');
  waits[0].reject(Error('activation denied')); await assert.rejects(first, /activation denied/);
  run.ctx.draw(); assert.ok(labels.includes('Silent / paused'));
  const retry = activate(run, 'Play / pause'); assert.equal(waits.length, 2);
  waits[1].resolve(); await retry; assert.equal(run.sources[0].playing, true);
});

test('single-file rejected old activation cannot erase a newer play choice', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'single'));
  await run.ctx.setup(); const waits = holdResume(run), oldPlay = activate(run, 'Play / pause');
  await activate(run, 'Play / pause'); const newPlay = activate(run, 'Play / pause');
  waits[1].resolve(); await newPlay;
  waits[0].reject(Error('old activation denied')); await assert.rejects(oldPlay, /old activation denied/);
  assert.equal(run.sources[0].playing, true);
  await activate(run, 'Play / pause'); assert.equal(run.sources[0].playing, false);
});

for (const id of ['bank', 'scales']) {
  test(`${id}: a newer selection wins even if an older activation resolves last`, async () => {
    const run = sketch(course().lessons.find(lesson => lesson.id === id));
    await run.ctx.setup(); const waits = holdResume(run);
    const first = activate(run, '1'), last = activate(run, '5');
    waits[1].resolve(); await last; waits[0].resolve(); await first;
    if (id === 'bank') {
      assert.equal(run.effects.filter(effect => effect[0] === 'play').length, 1);
      assert.deepEqual(run.sources.map(item => item.playing), [false, false, false, false, true]);
    } else {
      assert.deepEqual(run.effects.filter(effect => effect[0] === 'frequency'), [['frequency', 196.5]]);
    }
  });
}

test('microphone requests cannot overlap before audio resumes or during permission', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'mic'), { deferMicrophone: true });
  await run.ctx.setup(); const waits = holdResume(run);
  const first = activate(run, 'Use microphone'), second = activate(run, 'Use microphone');
  assert.equal(waits.length, 1, 'one activation is already pending');
  waits[0].resolve(); await Promise.all([first, second]);
  await activate(run, 'Stop microphone / practice');
  await activate(run, 'Use microphone'); run.ctx.draw();
  assert.equal(waits.length, 1, 'Stop cannot reopen an unresolved permission attempt');
  assert.equal(run.effects.filter(effect => effect[0] === 'microphone-request').length, 1);
  run.sources[0].node.state = 'started'; run.ctx.draw();
  assert.equal(run.sources[0].node.state, 'stopped', 'close a late grant after Stop');
  const retry = activate(run, 'Use microphone');
  assert.equal(waits.length, 2, 'a settled, closed stream can be requested again');
  waits[1].resolve(); await retry;
  assert.equal(run.effects.filter(effect => effect[0] === 'microphone-request').length, 2);
});

test('microphone permission that never becomes live stays locked and explains Run to retry', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'mic'), { deferMicrophone: true }), labels = [];
  run.ctx.text = value => labels.push(value); await run.ctx.setup();
  await activate(run, 'Use microphone'); run.ctx.draw();
  await activate(run, 'Stop microphone / practice');
  await activate(run, 'Use microphone'); run.ctx.draw();
  assert.equal(run.effects.filter(effect => effect[0] === 'microphone-request').length, 1);
  assert.ok(labels.some(label => /unavailable/i.test(label)));
  assert.ok(labels.some(label => /Run.*retry/i.test(label)));
});

test('microphone can retry a rejected audio resume without opening permission early', async () => {
  const run = sketch(course().lessons.find(lesson => lesson.id === 'mic'));
  await run.ctx.setup(); const waits = holdResume(run), first = activate(run, 'Use microphone');
  waits[0].reject(Error('activation denied')); await assert.rejects(first, /activation denied/);
  assert.equal(run.effects.filter(effect => effect[0] === 'microphone-request').length, 0);
  const second = activate(run, 'Use microphone'); assert.equal(waits.length, 2);
  waits[1].resolve(); await second; run.ctx.draw();
  await activate(run, 'Stop microphone / practice');
  const third = activate(run, 'Use microphone'); waits[2].resolve(); await third;
  assert.equal(run.effects.filter(effect => effect[0] === 'microphone-request').length, 2);
});

test('waveform labels its actual sample window for 48 kHz and 44.1 kHz audio', async () => {
  for (const [sampleRate, expected] of [[48000, '21.33 ms'], [44100, '23.22 ms']]) {
    const run = sketch(course().lessons.find(lesson => lesson.id === 'fft')), labels = [];
    run.ctx.getAudioContext = () => ({ sampleRate, resume: async () => {} });
    run.ctx.p5.FFT = class { analyze() { return Array(256).fill(0); } waveform() { return Array(1024).fill(0); } };
    run.ctx.text = value => labels.push(value); await run.ctx.setup(); run.ctx.draw();
    assert.ok(labels.some(label => label.includes(expected)), `${sampleRate}: ${expected}`);
  }
});
test('FFT display magnifies a quiet measured signal without increasing audio gain',async()=>{
 const run=sketch(course().lessons.find(x=>x.id==='fft')),bars=[],points=[];
 run.ctx.p5.FFT=class{analyze(){return [.025];}waveform(){return [-.025,.025];}};
 run.ctx.rect=(...args)=>bars.push(args);run.ctx.vertex=(...args)=>points.push(args);
 await run.ctx.setup();run.ctx.draw();assert.equal(bars[0][3],42.5);assert.equal(points[0][1],191.25);assert.equal(points[1][1],153.75);assert.deepEqual(run.effects.filter(x=>x[0]==='gain'),[['gain',.05]]);
});
test('FFT resolves the low-frequency range using 256 bins and draws only the first 32',async()=>{
 const run=sketch(course().lessons.find(x=>x.id==='fft')),sizes=[],bars=[],labels=[];run.ctx.p5.FFT=class{constructor(size){sizes.push(size);}analyze(){return Array.from({length:256},(_,i)=>i===10?.025:0);}waveform(){return [0,0];}};run.ctx.rect=(...a)=>bars.push(a);run.ctx.text=(...a)=>labels.push(a[0]);await run.ctx.setup();run.ctx.draw();assert.deepEqual(sizes,[256]);assert.equal(bars.length,32);assert(bars.every(a=>a[2]>0));assert(labels.some(x=>x.includes('3000 Hz')));
});
test('ear practice starts and stops both a quiet tonic reference and a moving oscillator',async()=>{
 const run=sketch(course().lessons.find(x=>x.id==='ear'));await run.ctx.setup();assert.equal(run.effects.filter(x=>x[0]==='start').length,0);await activate(run, 'Start');assert.equal(run.effects.filter(x=>x[0]==='start').length,2);activate(run, 'Stop');assert.equal(run.effects.filter(x=>x[0]==='stop').length,2);assert.deepEqual(run.effects.filter(x=>x[0]==='gain'),[['gain',.025],['gain',.025]]);
});

test('bank loads five numbered files and number keys choose valid array entries only', async () => {
  const run = sketch(course().lessons.find(x => x.id === 'bank'));
  await run.ctx.setup();
  assert.deepEqual(run.files, ['sound-0.wav', 'sound-1.wav', 'sound-2.wav', 'sound-3.wav', 'sound-4.wav']);
  for (const key of ['0', '6', 'a']) { run.ctx.key = key; await run.ctx.keyPressed(); }
  assert.equal(run.effects.filter(x => x[0] === 'play').length, 0);
  run.ctx.key = '5'; await run.ctx.keyPressed();
  assert.equal(run.effects.filter(x => x[0] === 'play').length, 1);
});

test('scale keys use the provided ratios and base frequency without an off-by-one note', async () => {
  const run = sketch(course().lessons.find(x => x.id === 'scales'));
  await run.ctx.setup();
  for (const key of ['1', '4', '8']) { run.ctx.key = key; await run.ctx.keyPressed(); }
  const frequencies = run.effects.filter(x => x[0] === 'frequency').map(x => x[1]);
  assert.equal(frequencies.length, 3);
  [131, 175.54, 262].forEach((expected, i) => assert.ok(Math.abs(frequencies[i] - expected) < 1e-9));
});

test('microphone routing disconnects speakers and requires the microphone control', async () => {
  const run = sketch(course().lessons.find(x => x.id === 'mic'));
  await run.ctx.setup();
  assert.ok(run.effects.findIndex(x => x[0] === 'disconnect') < run.effects.findIndex(x => x[0] === 'connect'));
  const button = run.controls.find(x => /use microphone/i.test(x.label));
  assert.ok(button, 'explicit permission button'); await activate(run, button.label);
  assert.equal(run.effects.filter(x => x[0] === 'microphone-request').length, 1);
  const stop = run.controls.find(x => /stop microphone/i.test(x.label));
  assert.ok(stop); await activate(run, stop.label);
  assert.ok(run.effects.some(x => x[0] === 'stop'));
});

test('worksheet delivers all five tasks and keeps composition optional for Week 11', () => {
  const data = course();
  assert.deepEqual(data.worksheet.map(x => x.number), [1, 2, 3, 4, 5]);
  for (const task of data.worksheet) {
    assert.ok(task.deliverable);
    assert.ok(data.lessons.some(x => x.id === task.lesson && x.worksheet.includes(task.number)));
  }
  assert.deepEqual(data.lessons.find(x => x.id === 'prepare').worksheet, []);
  assert.ok(data.foundations.some(x => x.term === 'await'));
});

test('resource links preserve legacy-version warnings and exclude private sharing tokens', () => {
  const resources = course().resources;
  for (const resource of resources) {
    const url = new URL(resource.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(!/unlocked_article_code|gift|token/i.test(url.search));
    assert.ok(resource.summary && resource.title && resource.group);
  }
  for (const id of ['class-mic', 'class-fft', 'class-hearing', 'class-melodies', 'class-ear']) {
    const item = resources.find(x => x.id === id);
    assert.ok(item && item.version && /legacy|older/i.test(item.version), id);
  }
  const mainWatch = resources.find(x => x.id === 'notes-neurons');
  assert.ok(mainWatch && mainWatch.group === 'required' && /26:00/.test(mainWatch.summary) && /1:14:00/.test(mainWatch.summary));
  const times = resources.filter(x => x.id.startsWith('notes-cue-')).map(x => Number(new URL(x.url).searchParams.get('t')));
  assert.deepEqual(times, [1593, 1940, 2335, 2700, 3534, 3850]);
});
