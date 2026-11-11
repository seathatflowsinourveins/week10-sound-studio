# Week 10 Guide Refinement Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for root UI/runtime work and a scoped worker for guide metadata. Steps use checkbox syntax.

**Goal:** Make the complete Week10 course easy to follow, one action and explained line at a time.

**Architecture:** Preserve native page and runtime; pair explanation/code and illustration/preview as aligned grid rows. Add original guide metadata and bounded silent SVG controls. Keep stored progress backward compatible.

**Tech Stack:** HTML/CSS/JS/SVG, pinned p5 2.3.4 + sound0.4.1, Node built-in tests.

**Spec:** docs/superpowers/specs/2026-11-10-guide-refinement.md

## Global constraints

- No new runtime dependencies or framework, no automatic audio/mic, no global settings changes.
- Do not overwrite restored drafts. Quizzes measure code concepts, not class submission or hearing performance.
- Original class sources stay credited; private inputs and raw evidence stay outside the public build.
- Source/main/served files must match exact CI head and release hashes.

## Review focus

- Imported version1 progress lacks new optional learning fields: preserve old content and independent checklist entries.
- Changed source code does not match guide anchors: do not silently highlight another line or replace edits.
- Silent illustration controls are distinct from actual sound; audio sliders can synchronize through bounded whitelisted value messages only.
- Dense diagrams at phone width: readable stacked data/controls and no body overflow.
- An incorrect quiz answer never completes a lesson or worksheet and feedback stays lesson-local.

## Tasks

- [x] Guide metadata: worker owns lesson-guide.js/test only; goals, exact source anchors, source IDs, concept checks and basic syntax examples. Compile/coverage tests first.
- [x] Root course/state: test FFT visible range, tonic lifecycle, expanded independent checks and optional lesson progress; implement/fix from primary pinned source.
- [x] Root layout/illustrations: index.html, studio.css, studio.js, new illustrations.js/test; aligned rows, interactive silent controls, anchor-focused practice, roadmap, sources, glossary and mobile jumps. Test actual route/draft/check behavior.
- [x] Verify:50 native checks, independent review/readback, actual browser controls and responsive390/800/1280 checks. Physical microphone consent stays with the learner.
- [x] Prepare publication: README/SOURCES/manifest, deterministic allowlist, complete bundles and Pages configuration. Actual publication completion is independently established by successful CI at the pushed SHA, exact hosted manifest/file hashes and the opened hosted lesson—not by this checklist.
