(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SoundGuide = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const lessons = {
    unlock: {
      goal: 'Start and stop one quiet tone deliberately.',
      before: 'Read setup as preparation and a button handler as a later action; async lets that handler use await to wait for audio to become available.',
      success: 'Run, press Play, then Stop; identify the line that starts the oscillator and the number that sets its frequency.',
      focus: [
        'createCanvas(480, 220);',
        'if (!playing) osc.start();',
        "osc = new p5.Oscillator(220, 'sine');"
      ],
      check: {
        question: 'Why does this sketch stay silent immediately after Run?',
        options: ['The canvas is too small for audio.', 'The oscillator is created in setup but starts only in the Play handler.', 'A sine oscillator cannot make sound.'],
        answer: 1,
        why: 'Creating an oscillator prepares it. Play waits for the browser AudioContext.resume() promise, then calls start(); draw only updates the picture.'
      },
      sources: ['p5-sound-reference', 'oscillator-reference', 'audio-context-resume']
    },
    single: {
      goal: 'Load one recording and control play or pause.',
      before: 'Try the first tone lesson, then keep sound-0.wav beside sketch.js and read await as waiting for the file to finish loading.',
      success: 'Press the canvas to play, press again to pause, and point to the filename you would replace with your own recording.',
      focus: [
        "sound = await loadSound('sound-0.wav');",
        'if (sound.isPlaying()) {',
        "sound = await loadSound('sound-0.wav');"
      ],
      check: {
        question: 'In this studio’s pinned p5.sound version, what does sound.loop() do here?',
        options: ['It configures repetition; sound.play() begins playback later.', 'It repeats the JavaScript setup function.', 'It asks for microphone permission.'],
        answer: 0,
        why: 'Here loop() sets the file to repeat. The canvas press calls play() or pause(); older tutorials may use different playback behavior.'
      },
      sources: ['class-load', 'tutorial-load']
    },
    bank: {
      goal: 'Choose among five recordings with one reusable function.',
      before: 'Load one file successfully, then read an array as an ordered list whose first position is zero.',
      success: 'Run with all five files, choose sound 5 with its button or key, and explain why the program uses array index 4.',
      focus: [
        "sounds[i] = await loadSound('sound-' + i + '.wav');",
        "if (key >= '1' && key <= '5') return playSound(Number(key) - 1);",
        'for (let i = 0; i < 5; i++) {'
      ],
      check: {
        question: 'Which array position does number key 5 select?',
        options: ['5, because the button says 5.', '0, because every array starts at zero.', '4, because the key number is reduced by one.'],
        answer: 2,
        why: 'Five entries occupy positions 0, 1, 2, 3, and 4. The controls show familiar numbers 1–5 and convert them to these indices.'
      },
      sources: ['worksheet', 'tutorial-load']
    },
    pitch: {
      goal: 'Change frequency, signal level, and waveform separately.',
      before: 'Use Play and Stop confidently, then change one control at a time so you can track what caused each change.',
      success: 'Keep frequency fixed while changing gain, then switch the waveform and name the control that changes tone color.',
      focus: [
        'frequency.input(() => osc.freq(Number(frequency.value())));',
        'gain.input(() => osc.amp(Number(gain.value()), 0.05));',
        'shape.changed(() => osc.setType(shape.value()));'
      ],
      check: {
        question: 'Which control switches the oscillator from sine to triangle while keeping its selected frequency?',
        options: ['The gain slider.', 'The waveform menu.', 'The canvas width.'],
        answer: 1,
        why: 'setType() changes the waveform and its harmonic content. The frequency and gain controls have separate jobs.'
      },
      sources: ['class-hearing', 'oscillator-reference']
    },
    scales: {
      goal: 'Build a playable scale from a base frequency and ratios.',
      before: 'Understand array positions and frequency, then read each ratio as a multiplier of the 131 Hz base.',
      success: 'Play notes 1, 4, and 8, inspect their displayed frequencies, then change a middle ratio while keeping the endpoints at 1 and 2.',
      focus: [
        'osc.freq(base * ratios[index]);',
        'const ratios = [1, 1.125, 1.25, 1.34, 1.5, 1.67, 1.875, 2];',
        'const ratios = [1, 1.125, 1.25, 1.34, 1.5, 1.67, 1.875, 2];'
      ],
      check: {
        question: 'With base = 131 and a selected ratio of 2, what frequency is set?',
        options: ['262 Hz.', '133 Hz.', '65.5 Hz.'],
        answer: 0,
        why: 'The sketch multiplies: 131 × 2 = 262. Doubling frequency gives an octave relationship; you can design other notes by changing their multipliers.'
      },
      sources: ['scale-sheet', 'class-melodies']
    },
    mic: {
      goal: 'Turn a level measurement into a deliberate visual response.',
      before: 'Read a condition as a true-or-false decision; starting browser audio and granting microphone permission are separate steps.',
      success: 'Cross the threshold with the practice slider, then request microphone access and check its status label before treating a value as live input.',
      focus: [
        'if (over && !above) shade = [random(90), random(90), random(90)];',
        'mic.start();',
        'const over = level !== null && level > Number(threshold.value());'
      ],
      check: {
        question: 'With the threshold fixed at 0.1, which event selects a new background?',
        options: ['Holding the level at 0.2 for another frame.', 'Moving the level from 0.2 down to 0.05.', 'Moving the level from 0.05 up to 0.2.'],
        answer: 2,
        why: 'over && !above detects an upward crossing. This adaptation chooses one color per crossing instead of flickering through new colors every frame above the threshold.'
      },
      sources: ['class-mic', 'tutorial-amplitude']
    },
    fft: {
      goal: 'Distinguish a frequency spectrum from a waveform.',
      before: 'Try the frequency control and read an array as a list of numbers that can be drawn in order.',
      success: 'Change the frequency, locate the bars and lower trace, and explain which shows frequency-bin amplitudes and which shows signal samples.',
      focus: [
        'frequency.input(() => osc.freq(Number(frequency.value())));',
        'const wave = fft.waveform();',
        "osc = new p5.Oscillator(440, 'sine');"
      ],
      check: {
        question: 'What do the spectrum bars represent in this sketch?',
        options: ['Normalized amplitudes in frequency regions, enlarged for display.', 'One named musical note per bar.', 'The oscillator’s volume-control settings.'],
        answer: 0,
        why: 'analyze() returns frequency-bin amplitudes for this pinned version. waveform() returns samples over time; display magnification changes the drawing, not the audio gain.'
      },
      sources: ['class-fft', 'fft-reference']
    },
    ear: {
      goal: 'Practice placing scale notes, then use the official activity.',
      before: 'Listen to Do-A-Deer, then use the practice’s fixed 235 Hz tonic as a reference while moving the other note.',
      success: 'Record eight practice marks and reveal the comparison; complete task 5 separately in the official trainer and manually save and submit the requested image.',
      focus: [
        'osc.freq(base * (1 + Number(position.value()) / width));',
        'if (!revealed && marks.length < ratios.length) marks.push(Number(position.value()));',
        "createButton('Save practice image').mousePressed(() => saveCanvas('ear-practice', 'png'));"
      ],
      check: {
        question: 'Which result belongs in the worksheet’s ear-training submission?',
        options: ['Any practice image automatically uploaded by this studio.', 'Your saved best result from the official class trainer, submitted as instructed.', 'A grade calculated by this studio’s Reveal button.'],
        answer: 1,
        why: 'This studio is practice. Open the official trainer and follow its mouse-move, click, Return, and Tab instructions; saving, uploading, and linking the image are manual steps.'
      },
      sources: ['do-a-deer', 'class-ear']
    },
    prepare: {
      goal: 'Notice timing and bring listening observations to class.',
      before: 'Read 1 as an event and 0 as a rest in the silent pattern, then open the assigned viewing and reading links.',
      success: 'Change one rest into an event, then record observations and questions from the Week 10 materials; keep any 60-second composition idea as optional Week 11 preparation.',
      focus: [
        'const current = floor(millis() / stepMilliseconds) % pattern.length;',
        'const pattern = [1, 0, 1, 0, 1, 1, 0, 0];',
        "text('Silent rhythm diagram — event / rest', 20, 35);"
      ],
      check: {
        question: 'What should you prioritize for Week 10?',
        options: ['Submitting a required 60-second composition.', 'Treating the silent timeline as proof of completed listening.', 'Completing the worksheet and assigned viewing and reading.'],
        answer: 2,
        why: 'The timeline illustrates timing. Complete the Week 10 activities and bring observations; a 60-second composition idea is optional preparation for Week 11.'
      },
      sources: ['notes-neurons', 'speech-song', 'freytag', 'amadeus']
    }
  };

  const syntax = [
    { term: '=', meaning: 'Assign the value on the right to the name on the left; this is not an equality test.', example: 'let playing = false;' },
    { term: '()', meaning: 'After a function name, parentheses call it and hold its inputs; they also group conditions or calculations.', example: 'osc.freq(220);' },
    { term: '{}', meaning: 'Braces group the instructions in a function or a condition’s block.', example: 'function stopTone() { osc.stop(); }' },
    { term: '[]', meaning: 'Brackets make an array or select an entry by its zero-based position.', example: 'const ratios = [1, 1.5, 2];\nconst first = ratios[0];' },
    { term: ';', meaning: 'A semicolon marks the end of a statement in these examples.', example: 'let chosen = 0;' },
    { term: '.', meaning: 'A dot accesses something belonging to an object, such as a method or property.', example: 'sound.play();' },
    { term: 'new', meaning: 'Create an object from a constructor, ready to use through its methods.', example: "let osc = new p5.Oscillator(220, 'sine');" },
    { term: '=>', meaning: 'An arrow defines a function; an event control can call that function later.', example: "createButton('Play').mousePressed(() => playNote(0));" },
    { term: '!', meaning: 'Logical not reverses a true-or-false result.', example: 'if (!playing) osc.start();' },
    { term: '&&', meaning: 'For conditions, both sides must be true; JavaScript checks the right side only if the left is truthy.', example: 'if (over && !above) changeColor();' },
    { term: 'true / false', meaning: 'Boolean values represent yes-or-no state without quotation marks.', example: 'let playing = false;\nplaying = true;' },
    { term: 'if', meaning: 'Run the following statement or block only when the condition is truthy.', example: 'if (playing) { osc.stop(); }' },
    { term: 'for', meaning: 'Repeat a block with a starting value, a continue condition, and an update after each turn.', example: 'for (let i = 0; i < 5; i++) { playSound(i); }' },
    { term: 'scope', meaning: 'A let or const name is available inside its enclosing block; a name declared outside functions can be shared by them.', example: 'let playing = false;\nfunction stopTone() { playing = false; }' }
  ];

  return { lessons, syntax };
});
