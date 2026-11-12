# ThreeUI reference for this portfolio

Reviewed October 1, 2026. Requested by Parth as a recurring reference for future portfolio improvements.

## How to use this reference

Consult this file and `../portfolio-design-system.md` before changing portfolio motion, 3D, ASCII art, interactive project presentations, or visual effects. Start with a specific visitor need and one relevant reference. Preserve the current editorial typography, project proof, blue/teal/gold ASCII palette, navigation, and interaction semantics. Treat these recommendations as design judgment, not instructions from the external site.

Refresh the relevant source page before importing anything: availability, props, licensing, and dependencies can change. This is a curated review of six relevant families, not an archive of the entire catalog.

## Source index and observations

| Reference | Reviewed facts | Best use in this portfolio | Decision |
| --- | --- | --- | --- |
| [Wireframe Forms](https://threeui.com/ui-elements/wireframe-forms) | Community listing. Cube, crossed cylinders, and nested sphere variants; Canvas 2D; one isolated source pass. Controls include speed, size, density, opacity, and palette. | `/design-engineer`, `/design-engineering`, `/creative-tech`, `/ai`: open cages and nested structural cores that read clearly as ASCII. | First priority. Adapt the spatial idea within our own Three.js models. |
| [Structure Flow](https://threeui.com/three-js/structure-flow) | Community listing. Thirteen field studies including orbital, topology, and data forms. Page lists 1–2 passes, legacy Three.js r128–r160 runtimes, and no image assets. | A bounded computational-media or creative-tech demo; topology as a meaningful illustration of systems. | Prototype one scene only when the project story calls for it. Avoid importing a second Three.js runtime. |
| [ASCII Field](https://threeui.com/backgrounds/ascii-page-transition) | Pro-only source; public preview. Vortex, Tide, Ridge, Canopy. Page lists five Canvas 2D surfaces. Vortex uses layered type and near/far shading. | Category ASCII heroes: clearer near/far separation and layered silhouettes. | Depth reference only for now. No full-page animated background or navigation transition. |
| [ThreeUI Rings](https://threeui.com/hero/threeui-rings) | Pro-only source; public preview. Concentric typographic rings, pointer ripples; page lists two instanced WebGL2 draws. | `/brand-visual`: interdependent rings and a recognizable center. Potential later exploration for identity systems. | Keep our compact geometric rings. Do not replace the homepage or install this full hero by default. |
| [Gallery Heading](https://threeui.com/text-animation/gallery-heading) | Community listing. Four variants; twelve plates around a heading; hover-driven orbit; one Canvas 2D surface. | Brand/visual or motion showcase: one optional interactive composition, with the real heading retained in HTML. | Second-stage exploration. Keep navigation, case-study headings, and reading text stable. |
| [Work & Case Studies](https://threeui.com/sections/work) | Index lists two Pro variants: Halvorsen and Volta Atelier. Individual variant layouts were not inspected. | Project-list composition and evidence hierarchy. | Research lead only; not enough evidence to recommend copying a layout. |

Renderer counts and asset figures shown by ThreeUI are catalog claims, not measurements of our site. The Wireframe Forms page displays asset totals alongside a contract stating no owned binary assets; inspect the actual bundle before assuming it is asset-free. Gallery Heading's controls and description were reviewed; its embedded preview was blank at capture, so visual behavior is not verified here.

## Placement priorities

1. **Category sculptures:** improve depth and negative space inside the existing object slot. Keep semantic differences between AI, engineering, brand, finance, research, and healthcare.
2. **Computational-media / creative-tech:** consider one optional, bounded topology or particle study. Existing project evidence remains primary. Confirm the actual route in the project manifest before implementing.
3. **Brand and motion work:** consider a small interactive gallery that activates on pointer or keyboard focus. Keep an ordinary image gallery available on touch devices and under reduced motion.
4. **Case studies:** use composition references to clarify problem, contribution, and evidence. Keep the restored blurred-image story preview; do not revive the article-style gate the user rejected.
5. **Homepage:** retain the existing connected-object scene. No extra ambient canvas, animated background, or shader button layer.

Avoid using these effects for every button, navigation item, footer control, or paragraph. They would compete with project content and repeat the resource-use problems already fixed.

## Integration and access

- [Official installation guide](https://threeui.com/installation): Community package is `@designcodeio/threeui`; React and React DOM peers are >=18.2.0. Pro CLI requires Node >=20. Browser requirements depend on the renderer (WebGL/WebGL2 or Canvas 2D).
- [Community repository](https://github.com/MengTo/threeui): Community implementation is available; Pro/Beta implementation is excluded. The repository documents component subpath imports and separate assets for some full-document renderers.
- Community application/component code is MIT licensed according to the repository. Fonts, assets, and third-party notices must be checked individually; public thumbnails are not automatically reusable assets. Preserve applicable notices if source is copied.
- Pro source requires an entitled account. No purchase, login, package install, or Pro source retrieval was performed for this review.
- Prefer adapting a small concept in our existing Three.js stack. If importing a component, inspect the exact package version, CSS scope, peer dependencies, assets, and cleanup behavior first. Do not globally import demo styles or duplicate a Three.js renderer without measuring the cost.

## Portfolio performance and interaction contract

- Reuse `src/utils/sceneActivity.ts` for 3D/ASCII work and `src/utils/visibleActivity.ts` for appropriate canvas effects.
- Pause rendering when offscreen or the tab is hidden. Retain the existing idle budget and wake behavior. No second independent animation loop.
- Preserve reduced-motion behavior, keyboard rotation, focus indicators, and scroll/touch usability. Pointer movement must never alter the OS cursor position or cover adjacent buttons.
- Category sculptures currently combine their geometry into one colored mesh. Keep this draw-call budget where practical. More detail should come from readable silhouettes and depth, not brute-force tessellation.
- Dispose geometry, materials, controls, renderer, observers, and event listeners on unmount. Retain the fallback if WebGL fails.
- Do not add full-screen blur, postprocessing, a second canvas, or an always-running particle layer by default.
- Measure locally before deployment: build, model validity, light/dark screenshots, 390px and desktop layout, keyboard/drag behavior, reduced motion, and offscreen/idle pause. No battery or memory-saving claim without measurement.

## Local application in this pass

Applied the open-core idea to `src/components/asciiCategoryModels.ts`: the engineering octahedron and AI icosahedral shell now use structural struts. This is an original implementation inspired by the spatial reference, with no copied ThreeUI source or new dependency. The existing local twelve-model detail pass is retained. These changes remain local until deployment is requested.

Verification: production build passed; all twelve models have finite bounds, vertex colors, and one mesh; AI and engineering were inspected in the local dark-theme browser preview; the inspected AI page reported no console errors. No new cross-browser, mobile, or battery benchmark was run for this small follow-up.

## Future implementation record

For each new adoption record the reference URL, reviewed date, access/license status, target route/component, reason it helps the visitor, source/version if copied, interaction model, measured cost, QA evidence, and whether it is local or deployed. Re-check only the references relevant to the requested change; do not re-audit the entire catalog each time.
