# Support Console UI + Training & Resources Plan

## Scope

Preserve all current support, Supabase, avatar, and GitHub Pages functionality while delivering a cohesive enterprise Console interface and an in-app, source-backed training library.

## Track A — UI system and product surfaces

1. [x] Audit current local/production shell, reference pack, asset paths, and existing process-reader regression tests.
2. [x] Consolidate design tokens and responsive layout for the login, app shell, Navigator, process drawer, profile, activation, feedback, and JA views.
3. [x] Keep working content/data flows intact; improve density, hierarchy, active navigation, account menu, focus handling, and mobile behavior.
4. [x] Replace invalid text-glyph icon rendering with compact, consistent icon treatment without adding fake features or data.

## Track B — Training & Resources

1. [x] Inspect the supplied public YouTube playlist and create a static manifest with only public video metadata, no runtime API key.
2. [x] Build client-side search/category filtering, lazy thumbnails, and an accessible in-app privacy-enhanced YouTube player with previous/next and YouTube fallback.
3. [x] Add only clear category-backed related-training mappings in the process drawer.
4. [x] Add unit/regression coverage for the manifest, filtering, player URL, and viewer behavior.

## Verification and release

1. [x] Run focused UI/training tests, full tests, lint, build, diff check, and a frontend secret scan.
2. [x] Push to the dedicated Zoom repository only; deploy via existing GitHub Pages workflow.
3. [x] Verify the live bundle, representative process/visual/avatar assets, training-player code path, and production CORS. JA login remains an authenticated manual smoke check because no credential is retained or exposed.
