# Portfolio Design System

This document turns the current portfolio style into a maintainable system. The goal is not to make every project identical. The goal is to make every page feel like the same designer made it: same chrome, same reading rhythm, same proof structure, same access rules, and controlled variation only where the project story needs it.

## System Position

The portfolio is an editorial technical portfolio for recruiters, founders, and creative technology peers. It should feel precise, proof-led, and built by someone who understands implementation constraints.

The visual language is:
- Light editorial canvas with optional dark mode.
- Figma/ruler chrome as subtle interface language.
- Serif display type for major project/title moments.
- Mono labels for metadata, navigation, and proof captions.
- Dense but readable product proof, not marketing filler.
- Project-specific color only as a quiet accent, never a full page reset.

## Recurring visual references

For 3D, ASCII, motion, and interactive project presentation, consult [the ThreeUI reference](references/threeui.md). It records reviewed examples, placement priorities, access requirements, and the performance rules for this portfolio.

## Source Of Truth

Use these files as the system spine:
- `src/styles/tokens.css`: color, typography, spacing, radius, z-index, glass, motion.
- `src/styles/base.css`: shared primitives such as `.wrap`, `.surface-glass`, `.mono-label`, `.pill-link`, focus states, reveal states.
- `src/styles/nav.css`: persistent navigation and chrome controls.
- `src/styles/work-page.css`: listing/card grammar and work mode layouts.
- `src/styles/case-study.css`: project page shell, case-study components, bottom nav, media framing, mobile consistency.
- `src/styles/nda-gate.css`: request-access pattern.
- `src/components/case-study/*`: reusable case-study blocks.
- `src/data/projects.ts`: project metadata, access model, summaries, routing, cards.

## Route Grammar

### Home

Home should answer four questions quickly:
- What does Parth do?
- What is the strongest proof?
- What range does the portfolio cover?
- How do I reach him?

Home can be more expressive than case studies, but it must still use the same tokens, card grammar, and chrome spacing.

### Work

Work is the recruiter index. It should remain fast to scan. Do not add another visual language here unless it becomes a reusable pattern across all work views.

Required:
- View switch stays compact and non-overlapping.
- Bottom filter nav never covers project content.
- Project cards use stable aspect ratios and readable overlay text.
- Request-access cards say "Quick glimpse" and never feel locked or blocked.

Work-page local tokens live in `src/styles/work-page.css` under `.page-work`.
Use these tokens before adding new view-specific values:
- `--work-card-radius`: image cards and media frames.
- `--work-panel-radius`: playlist, index, timeline, and filter panels.
- `--work-control-radius`: pills, tabs, category filters, and metadata chips.
- `--work-rule` and `--work-rule-strong`: default and hover/focus borders.
- `--work-panel-bg` and `--work-panel-bg-hover`: all Work list rows and panels.
- `--work-label` and `--work-label-active`: inactive and active control text.
- `--work-row-min`, `--work-row-gap`, and `--work-control-min`: stable scan rhythm.

Work typography:
- Serif: page title, project titles, timeline feature titles, selected card names.
- Sans: body copy, summaries, row names when they need dense scanning.
- Mono: counts, categories, years, NDA labels, view controls, and section markers.

Work interaction:
- Anything clickable must have a visible control shape before hover.
- Active controls use the same inset pill treatment across editorial, playlist, index, and arc.
- Focus states use `--work-focus` and must not be hidden behind glass or overlays.
- Card text sits on a persistent readability gradient, not hover-only contrast.

### Category Pages

Category pages are collection landing pages. They should use the registry as source of truth and show visible projects from that category. They should not hand-maintain stale project visibility.

Required:
- One hero.
- Featured project first.
- More projects from registry fallback.
- Same `ProjectCard` grammar as Work/Home.
- Same CTA pattern at the end.

### Public Case Studies

Every public case study should use this order unless the project has a strong reason to differ:
1. `Nav`
2. `ProjectHeader`
3. `ProjectQuickSummary` for flagship or selected work when enough data exists
4. Early proof media in fold two or three when the project has video, playable, or interactive work
5. Context and challenge
6. Process and decisions
7. Outcome and proof
8. Reflection
9. Credits or `CsThanks`
10. `BottomNav`
11. `NextProject`
12. `Footer`

#### Shared opening system

Mentra is the reference for the project-page opening, not a template for every chapter. Reuse these decisions across public and request-access projects:

1. The title and project name form one sentence by default. Use the stacked title mode when the deck is long or the project’s own typography needs to lead. Do not place an eyebrow above the title.
2. Keep no more than three discipline tags beside one compact live-product action.
3. Use one edge-to-edge hero image inside the same outer gutter as the navigation. The media frame keeps a consistent radius at every breakpoint.
4. Follow the hero with one concise overview row: narrative first, role and team second, timeline third. The narrative combines the problem and outcome by default.
5. Use sentence case for interface labels. Preserve real acronyms and product names.
6. On smaller screens, stack the overview in reading order: narrative, role, team, timeline.

`ProjectHeader` owns this opening system. Use `visualBriefMode="split"` only when the problem and outcome need to remain separate for comprehension.

Hero media is content, not decoration. Keep the project’s supplied image, poster, video controls, embed title, reduced-motion behavior, and aspect ratio. Pass a custom film or interactive preview through `visualHeroMedia`; the shared frame will size and clip it without replacing the underlying asset.

#### Shared reading behavior

- `ProjectQuickSummary` owns the quick-read path for flagship work. Its open variant can omit the image when the page already has a strong hero.
- `CsExpandPreview` must show real faded story content before the reveal action. A blank gate or isolated button does not communicate that content continues.
- `BottomNav` shows up to three direct destinations. Longer stories use a current-chapter control with a complete chapter menu, and the rail must remain clear of site controls, reading content, and safe areas.
- Space should create the default section rhythm. Use a divider only when it explains a table, sequence, comparison, or control boundary.

Keep these decisions project-specific:

- Project color and background treatment.
- Bespoke evidence chapters, diagrams, and interactive media.
- Mentra's three-size, regular-weight typography constraint.
- Mentra's product-testing metrics, green theme, and custom editorial problem/impact sections.

### Request-Access Case Studies

Request-access projects should show a safe public story first, then request access.

Required:
- `ProjectHeader` with `showHeaderSummary={false}` unless summary is fully public.
- `NdaPublicStory`.
- `NdaGate`.
- `BottomNav` with `placement="side"` on desktop, Glimpse and Access sections, and any request/live-site actions in the same vertical rail.
- `NextProject` should go to another safe page or safe preview.

Private details must not ship in the static bundle.

## Component Rules

Use shared case-study components before writing custom markup:
- `CsSection`: standard section label/title/content grid.
- `CsBody`: long-form text width and rhythm.
- `CsImage`: framed image with caption.
- `CsMediaSpotlight`: early video/interactive proof.
- `CsStatGrid`: metrics and proof.
- `CsFeatureGrid`: capability or feature cards.
- `CsSteps` and `CsProcessFlow`: process.
- `CsCallout`: one strong insight or constraint.
- `CsCredits` and `CsThanks`: closing and credits.
- `ProjectQuickSummary`: recruiter scan path.
- `BottomNav`: section navigation.
- `NextProject`: onward flow.

Do not use both a custom `.cs-thanks` section and `<CsThanks />` on the same page.

Clickable elements should read as clickable before hover:
- Inline editorial links use the `cs-text-link` treatment or the shared case-study inline-link selector.
- Case-study section navigation uses visible pill controls, not bare text labels.
- Embedded video or interactive proof uses `CsMediaSpotlight` with a short action cue.

## Token Rules

Use CSS variables from `tokens.css` before new literals.

Allowed local variation:
- `--project-color` per case study.
- Project-specific media aspect ratio.
- Project-specific immersive/interactable components.

Avoid:
- New raw hex colors in page files.
- Inline spacing styles for ordinary layout.
- New font-family declarations outside the system files.
- `!important` unless overriding third-party or browser behavior.
- New bottom bars or fixed controls without checking nav, agent, hand tracker, and safe-area spacing.

## Typography Rules

Use:
- `var(--serif)` for page titles and major editorial headings.
- `var(--sans)` for body and UI copy.
- `var(--mono)` for labels, metadata, section markers, and coordinates.

Line length:
- Body copy: 65 to 75 characters.
- Cards and proof blocks: shorter, scan-first copy.

Copy:
- Favor concrete proof over generic claims.
- Avoid empty labels and repeated headings.
- Avoid long dashes in rendered copy.

## Media Rules

All project media should have:
- Stable aspect ratio.
- Explicit alt text unless decorative.
- Lazy loading except first hero or first proof image.
- Same radius and border grammar via `case-study.css`.

Place video or interactive proof high:
- Fold two or three for projects where interaction is the point.
- Never bury the strongest proof below long process text.

## Responsive Rules

Minimum breakpoints to protect:
- 320, 360, 390, 430, 540, 640, 768, 1024, 1280, 1440, 1728.

Required behavior:
- Nav and bottom controls never cover important content.
- Project titles wrap without cropping.
- Cards keep stable dimensions.
- 3D or canvas elements reduce or hide on mobile if they dominate content.
- Touch targets remain usable.

## Current Consistency Hotspots

The system audit currently identifies these as the highest leverage cleanup areas:
- `CodeForBuildPage.tsx`: many inline styles and table/layout one-offs.
- `MentraBrandPage.tsx`: many inline styles and project-specific component styling.
- `AtpsPage.tsx`: many inline styles and bespoke content layout.
- `TheOmakasePage.tsx`: many inline styles and long custom layout sections.
- `TypefacePage.tsx`: custom typography is intentional, but layout should still use shared spacing primitives.
- `graveyard.css`, `about.css`, `homepage-wr.css`, `work-page.css`, and `case-study.css`: large style islands that need shared primitives before they are split.

## Build Plan

1. Keep `tokens.css` as the only token source.
2. Move repeated inline page styles into reusable case-study component props or classes.
3. Add missing `ProjectQuickSummary` to selected/tier-a work where registry summaries are complete.
4. Convert older long pages to `CsSection`, `CsBody`, `CsImage`, `CsStatGrid`, and `CsMediaSpotlight`.
5. Keep category and work pages fed by `src/data/projects.ts`, not duplicated project lists.
6. Run `npm run design:audit` before committing UI changes.
7. Run `npm run build` and screenshot QA after larger visual passes.


## Project reading flow (2026-10-01)

The user's approved direction uses https://mitalkamani.design/pmfdiscovery as a reading-layout reference. Keep a steady top-to-bottom sequence: concise introduction, actual project media, one overview, challenge, decisions with evidence, results, and learning. Preserve each project's factual material and access restrictions.

- Shared sections place headings above content, not in a narrow side column.
- The reading frame is at most 1040px, with responsive gutters and faint vertical guide lines. Text has a separate readable measure; images may fill the frame.
- Body text is 16px; section headings range from 24px to 32px. Avoid oversized paragraph statements and abrupt background changes between chapters.
- Keep project metadata compact. Show detailed timeline milestones through an optional disclosure.
- Respect `showHeaderSummary={false}` when a separate quick summary follows; do not repeat the same context and outcome twice.
- Retain the user's blurred public-image disclosure before deferred story content. Never expose protected material in that preview.
- Maintain chapter links, keyboard image previews, reduced motion, and media cleanup.

Implementation: `src/styles/project-reading.css` and shared case-study components. Do not apply these project rules to Home, About, Work, or category pages.

## Shared range sliders

All authored range inputs use `src/components/PortfolioSlider.tsx` and `src/styles/portfolio-slider.css`, including physical worlds, Shuffle, the original experiments, prototypes, typography, painting, lighting and studio zoom. The user requested an iOS-inspired glass treatment. The reference is Apple’s [Adopting Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass): a familiar slider whose knob changes material during interaction. This web treatment uses a translucent capsule, local highlights, a small pressed expansion and a blue value fill; it does not reproduce Apple’s native refraction engine.

Keep the input native so keyboard increments, min/max/step, labels, disabled state and touch dragging remain intact. The hit area is 44 pixels high. Controlled and uncontrolled values update the fill; light/dark variants use the same dimensions. Reduced motion disables transitions and expansion. Reduced transparency makes the thumb opaque, and forced colors restore the browser’s range appearance. Glass styling is confined to the thumb, with no added canvas, dependency or animation loop. Run `npm run qa:glass-sliders` for source coverage and representative route checks in Chromium desktop/mobile and mobile WebKit.


## Compact controls and sheets

Use `ios-controls.css` for the Work header view selector, project camera and instrument selectors, Shuffle views, and prototype tabs. Keep selected states in native `aria-pressed` or `aria-current`, retain visible keyboard focus, and use 44px touch targets. Glass stays on controls; project imagery, typography, and content layouts retain their authored styles. Low-power mode disables backdrop blur. Reduced motion disables transitions; reduced transparency and forced colors provide opaque alternatives.

`CompactSheet.tsx` provides mobile site navigation and case-study chapters. It portals above the page, makes the background inert, locks scroll, traps keyboard focus, supports Close/Escape/backdrop dismissal, and restores focus and prior inert state. Desktop chapters remain a popover. The chapter dock stays at the bottom left and recedes without disappearing while the reader pauses. Run `node scripts/ios-controls-qa.mjs` against the production preview for Chromium desktop/mobile and mobile WebKit in both themes.


## Experience recovery

Work categories use the `filter` query parameter, validated against the registry categories. Work view links preserve that selection. Mobile offers the same Editorial, Index and Arc choices in the page header, with a scrollable category row in Editorial.

Optional 3D content uses `ExperienceBoundary` so failed imports or lighting assets leave project content usable. Show original public evidence while physical objects prepare, with retry, reload and photograph links on failure. The homepage reports preparation and offers reload after failure. These states do not imply a percentage or successful prototype access. Mentra’s embed always offers a return to its recording and restores keyboard focus.

Physical-object resets can restore the previous slider values, camera selection and instrument focus. This undo does not restore a drawing or an arbitrary orbit pose. A subsequent settings change invalidates the reset snapshot. Compact sheets accept a downward drag from their handle, alongside Close, Escape and backdrop dismissal. Run `npm run qa:experience-recovery` for filter history, embed recovery, reset undo, swipe dismissal and blocked-asset checks.

## Desktop hero loading

Start the desktop lighting fetch from the small, asynchronous `hero-lighting-preload.js` while application modules load. Keep its guards aligned with `performance.ts`: homepage only, eligible hardware, no data saving, no reduced motion, no forced fallback and available WebGL. Reuse its capability probe and preload link when React starts. Warm the hero module and mount eligible desktop scenes after paint rather than waiting for idle plus an additional delay. Other deferred experiences keep their existing idle scheduling. Preserve the camera, materials, geometry, resolution and render settings.

While the hero prepares, load visible project images but hold the homepage's speculative 600px image margin. Restore that margin when the hero becomes ready, falls back, or the reader scrolls. A slow lighting download must not delay media for someone who starts reading. Memoize the hero's connecting-thread positions so hovering does not recreate unchanged geometry.

Run `npm run qa:hero-loading`, `npm run qa:home-loading` and `npm run qa:hero-efficiency` against a production preview. `npm run perf:hero` records cold HTTP-cache startup at 1440×1000, 5Mbps, 80ms latency and 4× CPU throttling. Set `QA_BASE_URL` for the candidate, `QA_COMPARE_URL` for a baseline, and `QA_OUTPUT_DIR` for the report. Run comparisons serially to avoid competition between browsers.

The October 12 comparison against c55d55c used three alternating baseline/candidate pairs. Median scene readiness changed from 5705.1ms to 5270.5ms (7.6% faster). Baseline samples were 5805.6, 5663.8 and 5705.1ms; candidate samples were 5193.5, 5270.5 and 7406.4ms. One candidate load was slower, and its mean was worse; these local samples do not establish field percentiles or a gain on every load. Median first contentful paint stayed near 0.79 seconds. Lighting transfer and GPU preparation remain costs under the unchanged-visual requirement. Deterministic first-frame comparisons found zero differing pixels in both themes, covering 566,226 pixels per theme.

The lighting follow-up stores the original RGBE channels as lossless row deltas in a gzip file. `npm run assets:hero-lighting` regenerates it from the retained HDR. The file is 965,763 bytes versus the source's 1,540,678 bytes; compare actual encoded transfer sizes when measuring a server that also compresses the original. `decodeHeroEnvironment.ts` uses an exponent lookup to produce the exact same 2,097,152 half-float values as RGBELoader, including alpha. Texture dimensions, filtering, orientation and color space remain unchanged; PMREM is still generated by the same renderer. The loader accepts both raw gzip and automatically decoded HTTP responses. Unsupported decompression, missing or malformed packed data fall back to the original HDR. If both fail, keep the existing page and recovery controls usable. The `qa:hero-loading` command covers exact texture values, guard exclusions, both delivery formats, original-HDR recovery and early scrolling.

Three alternating pairs against 06d34a6 measured median readiness at 5887.4ms before and 5159.5ms after (12.4% faster). Candidate samples were 5048.6, 6601.7 and 5159.5ms; the second pair was slower. Median FCP changed from 888ms to 904ms. Median lighting arrival changed from 3892.8ms to 3254.9ms; encoded transfer changed from 1,158,106 to 965,763 bytes (16.6% fewer bytes on this preview server). Both first-frame themes again had zero differing pixels. Raw samples and conditions are in `docs/performance/hero-lighting-2026-10-12.json`. Compare within this batch rather than combining timings from different sessions. No field or guaranteed per-load speed claim is established.

## Visitor notes

`/notes` is a quiet reading and writing surface inspired by Rachel Chen’s notes wall (reviewed October 13, 2026). Use the established warm background, General Sans body text, and Nikolas page title. Notes show their full text, author, and date without hover. Rectangular paper surfaces use the small radius and a faint border; the dashed New note control opens an inline form. The board moves from four columns to one, keeping DOM and visual order aligned. No scattered pins, artificial cursor tracking, or decorative note rotations.

Notes is accessible from the footer only; keep it out of desktop and mobile navigation. The footer uses one Notes row with a description and an Open notes action instead of an interactive canvas. Preserve the contact links, arcade, location, clock, and past-portfolio link. Loading placeholders, empty and retry states, disabled posting, draft retention, and pending-review feedback are required. Notes keep the `/guestbook` storage route; do not migrate or mix in project feedback.

Local unconfigured previews show labeled fictional notes with a hide/show control. Keep sample entries out of storage and off public hostnames. The compact header leads directly to the wall, author and sample labels share one metadata row, and equal-height cards align within each row. The expanded desktop form spans two columns and two rows; mobile uses one column.

### Standalone actions and inline links

Use the existing `glass-action` control for standalone navigation or actions on the Work, Experiences, workshop and case-study reading surfaces. Use `glass-segments` for sibling views such as Work/Experiences. Do not introduce a bottom-rule-only button. Keep contextual links within paragraphs and policy text as underlined text links; their underline identifies a link without interrupting the sentence. Case-study prose link selectors must exclude `.glass-action`.
