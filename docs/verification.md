# Verification record

Initial acceptance: nine ordered lessons with every code line explained, real p5 code that changes with the lesson, all five worksheet tasks and class resources, local progress transfer, owned sound assets, no automatic microphone request, gesture-gated sound, a working static build and source/build parity. Actual browser, audible playback and physical iPhone behavior are separate checks.

Native checks use Node's built-in test runner; no package install is required. Tests cover:

- All nine original programs compile. Setup/draw stay silent and do not request a microphone in controlled API fixtures.
- File play/pause, five-file loading/key mapping, class ratios, explicit microphone routing and threshold concepts.
- Each displayed source line has an explanation; worksheet/source/resource coverage is explicit.
- Local state normalization, bounded data, per-lesson position, draft restoration, reversible reset and origin/token checks.
- Preview readiness waits for first draw. Stop closes the context, cancels late microphone grants, stops active tracks, blocks sketch events and preserves native Tab navigation.
- Five generated PCM WAVs have valid headers, distinct samples, faded edges and bounded amplitude.
- ZIP CRCs, exact source and archive paths; independent Python zipfile/wave inspection confirmed all nine bundles and five samples.
- Deterministic public build, pinned vendor hashes, every file hash, adjacent standalone sound assets and private input exclusion.

Independent read-only review caught early ear-answer disclosure, post-stop handlers, Tab handling, stale frequency text, missing standalone WAVs, a README link and misleading universal Play instructions. These were corrected and covered by applicable checks. A review during concurrent work saw two expected red tests; subsequent passing runs do not erase that earlier result.

Computer Use was stopped by a physical Escape press while opening the material folder. Native work continued without a browser workaround. The learner later explicitly requested relaunch in the current browser, authorizing browser checks to resume.

Actual in-app browser checks: all nine lesson previews reached ready state. File playback/pause, sample-bank buttons, pitch/waveform controls, scale buttons, simulated threshold, oscillator FFT, ear Start/Mark/Reveal/Stop, silent rhythm, Materials (42 cards), Worksheet (five tasks/URL fields), Notes, Run-after-Stop, and next/previous line pairing were exercised. Pitch/threshold controls updated the adjacent SVG. The initial FFT was too small at quiet gain; a fixed, labeled ×20 drawing scale made the measured waveform visible without raising audio gain. The logical canvas size now reads 480×220 rather than density-scaled backing pixels. At a temporary 390×844 viewport, the columns stacked and document content/client widths both measured 375 px (the scrollbar accounts for the remainder); the viewport was reset afterward.

One early unattributed MutationObserver console error was recorded; the app/runtime source has no MutationObserver, subsequent previews reached ready and no associated sketch error was reported. A read-only canvas-pixel inspection was unavailable through the browser DOM API, so visual confirmation used screenshots instead. Neither failure was counted as a passed check.

Current native suite: 30 passing tests. Actual browser context activation and the live graphs were observed. Physical speaker audibility, microphone permission and physical iPhone hardware remain unverified. The learner controls microphone consent; no permission prompt was accepted and no microphone data was recorded or uploaded.

Dependency decisions: class-matched p5 2.3.4 + p5.sound 0.4.1 held despite upstream sound 0.4.2. See SOURCES.md for source identities, failed lookups and recheck conditions. Workflow action tags were resolved through GitHub's native API and pinned to full SHAs before use.
