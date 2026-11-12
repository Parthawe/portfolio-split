export type DigitalExperience = { slug: string; mode: 'prototype' | 'access' | 'reference' | 'live'; description: string; href?: string }
export const digitalExperiences: DigitalExperience[] = [
  { slug: 'mentra', mode: 'prototype', description: 'Try the glasses onboarding flow' },
  { slug: 'mentra-miniapps', mode: 'prototype', description: 'Discover an app, inspect permissions, and launch it' },
  { slug: 'clawed-chat', mode: 'prototype', description: 'Edit a draft, approve it, and inspect its receipt' },
  { slug: 'executivelens', mode: 'prototype', description: 'Meeting replay with inspectable summary citations' },
  { slug: 'org-dashboard', mode: 'prototype', description: 'Browse knowledge and review an agent action' },
  { slug: 'healthapp', mode: 'prototype', description: 'Adjust daily capacity and review a lighter plan' },
  { slug: 'ballah-code', mode: 'prototype', description: 'Edit a component and review a proposed change' },
  { slug: 'vj-software', mode: 'prototype', description: 'Choose a parking space and review the booking' },
  { slug: 'code-for-build', mode: 'prototype', description: 'Build a page with blocks and inspect its code' },
  { slug: 'raahi-project', mode: 'prototype', description: 'Plan a sample journey and follow its legs' },
  { slug: 'transfi-project', mode: 'access', description: 'Public preview and reviewer access', href: '/transfi-project#case-study-access-transfi-project' },
  { slug: 'zentipay', mode: 'access', description: 'Public preview and reviewer access', href: '/zentipay#case-study-access-zentipay' },
  { slug: 'cuetv', mode: 'access', description: 'Public preview and reviewer access', href: '/cuetv#case-study-access-cuetv' },
  { slug: 'ai-voice', mode: 'access', description: 'Public preview and reviewer access', href: '/ai-voice#case-study-access-ai-voice' },
  { slug: 'medimorpho', mode: 'access', description: 'Public overview and private review request', href: '/medimorpho#case-study-access-medimorpho' },
  { slug: 'ibm', mode: 'reference', description: 'Encrypted-computation research', href: '/ibm' },
  { slug: 'office-of-diversity', mode: 'reference', description: 'Original interactive-report design', href: '/office-of-diversity#cs-report' },
  { slug: 'the-point-cdc', mode: 'live', description: 'Explore the community website', href: '/the-point-cdc' },
]
export const digitalExperience = (slug: string) => digitalExperiences.find(item => item.slug === slug)
export const digitalHref = (item: DigitalExperience) => item.href ?? `/${item.slug}/prototype`
export const projectExperience = (slug: string) => experienceRegistry.find(item => item.slug === slug)
export const approvedExperiences = () => experienceRegistry.filter(item => item.status === 'approved')
export function experienceHref(slug: string) {
  const item = projectExperience(slug)
  return item?.status === 'approved' ? item.href : `/${slug}`
}
export function experienceLabel(slug: string) {
  return projectExperience(slug)?.label ?? 'Read the case study'
}
export const mentraOnboardingPrototype = 'https://www.figma.com/proto/UqMHlp3DWI2erzruqcCZNd/Mentra-All-in-One--Copy-?node-id=63254-44046&viewport=-612%2C-601%2C0.23&t=McNEtHe1mXIBKbD1-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=63254%3A44046&show-proto-sidebar=1&page-id=63254%3A33903'

export type ExperienceFormat = 'physical' | 'prototype' | 'tool' | 'experiment' | 'media' | 'case-study'
export type ExperiencePresentation = '3d' | 'anatomy' | 'prototype' | 'original-interface' | 'original-experiment' | 'media' | 'case-study'
export type ExperienceStatus = 'approved' | 'draft' | 'queued' | 'reference'
export type ProjectExperience = { slug: string; collection?: 'game'; presentation: ExperiencePresentation; format: ExperienceFormat; status: ExperienceStatus; href: string; label: string; evidence: string; hasPrivatePrototype?: boolean }
// Explicit curation: adding a project never automatically creates an experience.
export const experienceRegistry: ProjectExperience[] = [
  {"slug": "mentra", "presentation": "prototype", "format": "prototype", "status": "draft", "href": "/mentra/prototype", "label": "Complete glasses onboarding", "evidence": "Pinned MentraOS pairing source a02dade; simulated native responses; original Figma and recording retained; awaiting user review"},
  {"slug": "mentra-miniapps", "presentation": "prototype", "format": "prototype", "status": "draft", "href": "/mentra-miniapps/prototype", "label": "Discover and launch a glasses app", "evidence": "Released Miniapp Store plus verified original Mira, Streamer, Notes and Captions Figma flows; local study retained separately"},
  {"slug": "clawed-chat", "presentation": "prototype", "format": "prototype", "status": "draft", "href": "/clawed-chat/prototype", "label": "Approve an assistant action and inspect its receipt", "evidence": "Documented action safety and receipts; existing prototype uses sample data"},
  {"slug": "executivelens", "presentation": "prototype", "format": "prototype", "status": "draft", "href": "/executivelens/prototype", "label": "Inspect a meeting summary citation", "evidence": "Existing MeetingTimeline and prepared transcript; preserve embedded demonstration"},
  {"slug": "org-dashboard", "presentation": "prototype", "format": "prototype", "status": "draft", "href": "/org-dashboard/prototype", "label": "Review organizational context and approve an action", "evidence": "User-confirmed inactive concept; editable Figma task draft u9ZRlQnwfUsErk2bFa9Ceq; prepared knowledge/review/receipt states; awaiting review"},
  {"slug": "cuetv", "presentation": "prototype", "format": "case-study", "status": "reference", "href": "/cuetv", "label": "Read the safe discovery and playback story", "evidence": "NDA public preview; retain existing access gate"},
  {"slug": "healthapp", "presentation": "prototype", "format": "prototype", "status": "draft", "href": "/healthapp/prototype", "label": "Rebalance tasks around daily capacity", "evidence": "Original Health App overview plus editable Figma routine-planning task draft; reconstructed subset, not recovered original screens"},
  {"slug": "ibm", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/ibm", "label": "Read the encrypted-computation research", "evidence": "Research glimpse; no released runnable encryption implementation"},
  {"slug": "ballah-code", "presentation": "prototype", "format": "prototype", "status": "draft", "href": "/ballah-code/prototype", "label": "Review a proposed component change", "evidence": "Original IDE product-window evidence plus editable Figma validation-review task draft; prepared code and receipt states"},
  {"slug": "ai-voice", "presentation": "prototype", "format": "case-study", "status": "reference", "href": "/ai-voice", "label": "Read the public voice-selection story", "evidence": "NDA preview and existing access gate; no synthetic substitute for protected voice samples"},
  {"slug": "the-point-cdc", "presentation": "original-interface", "format": "case-study", "status": "reference", "href": "/the-point-cdc", "label": "Explore the documented community website", "evidence": "Original website link and case study; no standalone room needed"},
  {"slug": "office-of-diversity", "presentation": "original-interface", "format": "case-study", "status": "reference", "href": "/office-of-diversity", "label": "Read the report design story", "evidence": "Public report evidence; no room or invented report content"},
  {"slug": "jugalbandi", "presentation": "anatomy", "format": "physical", "status": "draft", "href": "/jugalbandi/world", "label": "Operate instruments and observe acoustic mechanisms", "evidence": "Installation photographs and film; current synthetic sound and model need fidelity review"},
  {"slug": "enigma", "presentation": "3d", "format": "physical", "status": "draft", "href": "/enigma/world", "label": "Draw or type and inspect the light network", "evidence": "200-neuron sculpture photographs, film and original EnigmaInteractive; tablet strokes drive input lights directly; drawing labels are visitor-selected, not recognized"},
  {"slug": "shuffle", "presentation": "3d", "format": "physical", "status": "approved", "href": "/shuffle/simulation", "label": "Rebalance student-life priorities", "evidence": "User-approved motorized-fader reconstruction and existing ShuffleInteractive"},
  {"slug": "making-of-time", "presentation": "original-experiment", "format": "experiment", "status": "reference", "href": "/making-of-time", "label": "Compare shadow, mechanism and software time", "evidence": "Original film and embedded ClockTrio; preserve the experiment rather than a photograph on a bench"},
  {"slug": "sea-of-salt", "presentation": "3d", "format": "physical", "status": "draft", "href": "/sea-of-salt/world", "label": "Turn the mill to advance the salt story", "evidence": "Original mill photographs, story and embedded SaltSimulation; direct rotation requires review"},
  {"slug": "flow-fields", "presentation": "case-study", "format": "experiment", "status": "reference", "href": "/flow-fields", "label": "Tune an explanatory flow field", "evidence": "Explanatory GenerativeCanvas with noise-field particles; original 2024 sketch is unavailable"},
  {"slug": "embodied-web", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/embodied-web", "label": "Read body-input experiment evidence", "evidence": "StudyExplorer and related project evidence; no released standalone pose-controlled experience verified"},
  {"slug": "feeling-patterns", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/feeling-patterns", "label": "Read tactile-interface research", "evidence": "Textile study and related evidence; no verified haptic hardware simulation"},
  {"slug": "performance-by-design", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/performance-by-design", "label": "Read live-performance design studies", "evidence": "StudyExplorer and related evidence; avoid invented cue or audience behavior"},
  {"slug": "on-becoming", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/on-becoming", "label": "Read the practice essay", "evidence": "Reflective writing and related work; no standalone simulation warranted"},
  {"slug": "storytelling", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/storytelling", "label": "Read narrative structure studies", "evidence": "StudyExplorer and related evidence; no separate runnable narrative verified"},
  {"slug": "dna-speculative", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/dna-speculative", "label": "Examine the speculative artifact", "evidence": "Public speculative-design glimpse; no unsupported biology model"},
  {"slug": "comp-media", "presentation": "original-experiment", "format": "experiment", "status": "reference", "href": "/comp-media", "label": "Paint with camera pixels", "evidence": "Existing PixelPainting restoration and original p5.js source; retain embedded experiment"},
  {"slug": "hypercinema", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/hypercinema", "label": "Read immersive media studies", "evidence": "StudyExplorer and related evidence; no verified navigable 360 asset in the standalone room"},
  {"slug": "applications", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/applications", "label": "Read application development studies", "evidence": "StudyExplorer evidence; no project-specific standalone implementation verified"},
  {"slug": "messy-humans", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/messy-humans", "label": "Read inclusive design research", "evidence": "Research and StudyExplorer; no invented personas or task outcomes"},
  {"slug": "production-studio", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/production-studio", "label": "Read collaborative installation production", "evidence": "Production evidence and StudyExplorer; generic room does not demonstrate production work"},
  {"slug": "arcade-lab", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/arcade-lab", "label": "Read controller and party-game studies", "evidence": "Related evidence and Omakase project; no separate arcade-lab game verified"},
  {"slug": "black-hole", "presentation": "3d", "format": "physical", "status": "draft", "href": "/black-hole/world", "label": "Operate each documented physical study", "evidence": "Exhibit photographs and mechanisms; alignment and separate study behavior require review"},
  {"slug": "uv-light", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/uv-light/world", "label": "Reveal documented blacklight marks", "evidence": "Original installation photographs; retain the case study without a photographic room"},
  {"slug": "the-omakase", "collection": "game", "presentation": "original-experiment", "format": "experiment", "status": "draft", "href": "/experience-preview/the-omakase", "label": "Play the original two-player sushi game", "evidence": "Verified itch.io Unity upload 11124779 and published keyboard controls; photo-based arcade presentation; two-player hardware keyboard required; awaiting review"},
  {"slug": "revolving-stage", "presentation": "anatomy", "format": "physical", "status": "draft", "href": "/revolving-stage/world", "label": "Explore the stage from base to performance", "evidence": "Eight-chapter Anatomy journey; original assembly, axle, caster, rotation and scenic drawings alongside interactions; internal fits illustrative; awaiting review"},
  {"slug": "moniac-machine", "collection": "game", "presentation": "original-experiment", "format": "experiment", "status": "draft", "href": "/moniac-machine", "label": "Operate the original economic strategy experiment", "evidence": "Original MoniacSimulator and cabinet film; remove invented valve mappings in a replacement"},
  {"slug": "dumb-waiter-set-design", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/dumb-waiter-set-design", "label": "Examine the original scenic model", "evidence": "Scenic-model photographs; no measured interactive reconstruction verified"},
  {"slug": "drowning", "presentation": "media", "format": "case-study", "status": "reference", "href": "/drowning", "label": "Explore lighting on the documented scenic design", "evidence": "Original scenic scale-model photograph and scene boards; reader compares distinct views, not a recovered lighting transition"},
  {"slug": "sculpture", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/sculpture", "label": "Study original figurative sculpture photographs", "evidence": "Photographic evidence only; no scan or faithful reconstructed geometry"},
  {"slug": "mentra-brand", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/mentra-brand", "label": "Examine identity, packaging and campaign work", "evidence": "Brand assets and renders; no documented editable identity rules verified"},
  {"slug": "tedx", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/tedx", "label": "Examine the fabricated parallax stage", "evidence": "Original stage design and build evidence; defer 3D until dimensions and interaction are supported"},
  {"slug": "typeface", "presentation": "original-experiment", "format": "tool", "status": "draft", "href": "/typeface/workshop", "label": "Type, inspect, reshape and export real glyphs", "evidence": "Supplied OTF/WOFF2 files and Glyphs sources; new SVG workshop awaiting user review"},
  {"slug": "atps", "presentation": "media", "format": "media", "status": "draft", "href": "/atps", "label": "Find and listen to verified conversations", "evidence": "Apple Podcasts show 1524982835 and Anchor RSS located; 45 episode enclosures verified with HTTP 206; native listening archive awaiting review"},
  {"slug": "vishwaconclave", "presentation": "case-study", "format": "case-study", "status": "reference", "href": "/vishwaconclave", "label": "Explore event identity across editions", "evidence": "Flattened campaign boards and motion-2021 films; editable identity components and rules not recovered"},
  {"slug": "glassly", "presentation": "original-interface", "format": "case-study", "status": "reference", "href": "/glassly", "label": "Explore the wearable platform website and original miniapp demo", "evidence": "Original Glassly site source, synchronized phone/glasses HeroDemo and September 2026 brand guidelines; embedded demonstration uses labelled illustrative content"},
]
