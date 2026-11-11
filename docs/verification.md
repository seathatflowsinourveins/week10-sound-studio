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

Current limitations: Computer Use was stopped by a physical Escape press while opening the material folder. Native work continued without a browser workaround. Permission to resume the actual browser/layout/audio checks was requested separately. Automated fixtures do not prove audible output, microphone permission or iPhone hardware operation. Do not mark those checks passed from this record alone.

Dependency decisions: class-matched p5 2.3.4 + p5.sound 0.4.1 held despite upstream sound 0.4.2. See SOURCES.md for source identities, failed lookups and recheck conditions. Workflow action tags were resolved through GitHub's native API and pinned to full SHAs before use.
