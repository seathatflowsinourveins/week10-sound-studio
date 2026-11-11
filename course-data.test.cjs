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
function sketch(lesson) {
  const effects = [], controls = [], files = [];
  class Source {
    constructor(...args) { this.args = args; this.playing = false; this.node = { state: 'stopped' }; }
    amp(n) { assert.ok(n >= 0 && n <= 0.06, 'example gain must remain quiet'); effects.push(['gain', n]); }
    freq(n) { effects.push(['frequency', n]); }
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
    start() { effects.push(['microphone-request']); this.node.state = 'started'; }
  }
  function element(label, value) {
    const control = { label, current: value, callbacks: {},
      value(n) { if (n !== undefined) this.current = n; return this.current; },
      mousePressed(fn) { this.callbacks.press = fn; return this; },
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
    userStartAudio: async () => { effects.push(['unlock']); },
    background() {}, fill() {}, noFill() {}, noStroke() {}, stroke() {}, strokeWeight() {},
    text() {}, textSize() {}, textAlign() {}, line() {}, circle() {}, ellipse() {}, rect() {},
    beginShape() {}, endShape() {}, vertex() {}, describe() {},
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
  return { ctx, effects, controls, files };
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

test('single-file mouse press plays then pauses after the awaited file load', async () => {
  const run = sketch(course().lessons.find(x => x.id === 'single'));
  await run.ctx.setup();
  assert.deepEqual(run.files, ['sound-0.wav']);
  await run.ctx.mousePressed(); await run.ctx.mousePressed();
  assert.deepEqual(run.effects.filter(x => ['play', 'pause'].includes(x[0])), [['play'], ['pause']]);
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
  assert.ok(button, 'explicit permission button'); await button.callbacks.press();
  assert.equal(run.effects.filter(x => x[0] === 'microphone-request').length, 1);
  const stop = run.controls.find(x => /stop microphone/i.test(x.label));
  assert.ok(stop); await stop.callbacks.press();
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
