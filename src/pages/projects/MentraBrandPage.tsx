import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import { projectImageProps } from '../../utils/projectImage'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import ProjectOverview from '../../components/case-study/ProjectOverview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsImage from '../../components/case-study/CsImage'
import CsInfoGrid from '../../components/case-study/CsInfoGrid'
import CsCredits from '../../components/case-study/CsCredits'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

const P = '/Assets/Projects/mentra-brand/photos'

export default function MentraBrandPage() {
  return (
    <>
      <Helmet>
        <title>Mentra Brand &amp; Packaging &middot; Parth Pawar</title>
        <meta name="description" content="Brand identity and packaging design for Mentra Live AI smart glasses: logo, color, packaging, booklet, social, ads, and product renders." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Mentra Brand & Packaging · Parth Pawar" />
        <meta property="og:description" content="Brand identity & packaging for AI smart glasses shipping at $299." />
        <meta property="og:image" content={`https://designwhich.works${P}/render-both-frames.webp`} />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--mentra-brand" style={{ '--project-color': '#00B869' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="brand"
          backLabel="Back to Work"
          tags={['Brand Identity', 'Packaging Design', 'Art Direction', 'Smart Glasses']}
          title="Mentra Brand & Packaging"
          subtitle="Designing the retail, launch, and packaging system that helps new hardware earn trust before first use"
          visualTitleMode="stacked"
          info={[
            { label: 'Role', value: 'Head of UI/UX — sole designer across all brand surfaces' },
            { label: 'Timeline', value: 'Q3 2025 – Present' },
            { label: 'Scope', value: 'Logo, color, type, packaging, booklet, ads, social, renders' },
            { label: 'Status', value: 'Shipping — in customers\u2019 hands' },
          ]}
          heroImage={`${P}/render-both-frames.webp`}
          heroAlt="Mentra Live smart glasses — black and transparent frame variants"
        />

        <ProjectOverview
          id="cs-overview"
          sections={[
            {
              label: 'The Constraint',
              content: 'Hardware gets judged before it turns on. The box, booklet, renders, and launch surfaces had to make a young company feel reliable next to much bigger incumbents.',
            },
            {
              label: 'My Role',
              content: 'I owned logo, packaging, booklet, creator guide, ad language, renders, and the reusable system behind them.',
            },
          ]}
        />

        {/* ── Hero render ── */}
        <CsImage src={`${P}/packaging-box-black.png`} alt="Mentra Live packaging dieline for the black frame variant, showing product renders, logo placement, QR setup panel, and box structure" />

        {/* ================================================================
            01 — LOGO
            ================================================================ */}
        <CsExpandPreview>
        {/* ================================================================
            03 — PACKAGING (the centerpiece)
            ================================================================ */}
        <CsSection id="cs-packaging" label="03 &mdash; Packaging" title="Unboxing Is the First Interaction">
          <CsBody>
            <p>The box is the first interaction. It needed to feel premium next to better-funded hardware brands without pretending to be them.</p>
            <p>The brand pattern is embossed into white stock. The product name is spaced uppercase for clarity, and &ldquo;Designed on Earth&rdquo; nods to the open-source community behind MentraOS.</p>
          </CsBody>
        </CsSection>

        <section className="cs-section"><div className="wrap"><h2 className="cs-section-title">Inspect the product details</h2><CsBody><p>Compare the original launch renders at a consistent scale. These are project assets, not newly generated product variations.</p></CsBody><CsScreenExplorer format="landscape" label="Choose a product detail" screens={[
          {title:'Both frames',label:'Black and transparent',src:`${P}/render-both-frames.webp`,alt:'Original render of black and transparent Mentra frames',caption:'The same product identity carried across two frame finishes.'},
          {title:'Hinge',label:'Physical detail',src:`${P}/render-hinge-detail.webp`,alt:'Original close-up render of the Mentra hinge',caption:'The original detail render shows the joint and material transition.'},
          {title:'Transparent frame',label:'Top view',src:`${P}/render-transparent-top.webp`,alt:'Original transparent Mentra frame top-view render',caption:'An alternate view of the same documented frame.'}
        ]}/></div></section>
        <CsSection title="One structure, two variants">
          <CsBody><p>The packaging work went through seven iterations. The three artifacts below show the shared box structure, the second frame variant, and the production label. They document the final constraints rather than a complete revision history.</p></CsBody>
          <CsScreenExplorer format="landscape" label="Compare Mentra packaging artifacts" screens={[
            { title: 'Black frame', label: 'Shared structure and setup', src: `${P}/packaging-box-black.png`, alt: 'Black-frame packaging dieline with product image, quickstart QR panel, and flap branding', caption: 'The dieline carries product identification, the brand pattern, and the setup route in one structure. Inspect the QR panel and the position of the product render.' },
            { title: 'Clear frame', label: 'A second product variant', src: `${P}/packaging-box-clear-1.webp`, alt: 'Clear-frame packaging dieline using the same structure with transparent-frame imagery', caption: 'The clear-frame box keeps the structural layout while changing the product imagery. The two variants need to be distinguishable without rebuilding the packaging system.' },
            { title: 'Factory label', label: '90.24 × 23.95 mm', src: `${P}/packaging-box-clear-2.webp`, alt: 'Annotated factory label with dimensions, barcode, model identification, and regulatory text', caption: 'The fixed label area holds model identification, barcode, and regulatory text. Outlined vectors and bleed/crop marks remove font dependencies from the factory handoff.' },
          ]} />
        </CsSection>

        <CsSection title="What changed between surfaces">
          <CsBody>
            <p><strong>Product identification.</strong> Black and clear frames share the structural die-cut. The product render changes with the SKU so a person can identify the variant before opening the box.</p>
            <p><strong>Production information.</strong> Model identification, barcode, and regulatory text fit a separate 90.24 × 23.95 mm label. Keeping those details together preserves room for the product image and setup panel.</p>
            <p><strong>Fabrication.</strong> The charging-case mark needs 0.3 mm outlined strokes for the factory handoff. The 150 × 150 mm microfiber cloth uses a heat-pressed mark. Each output needs its own production artwork even when the visible identity stays the same.</p>
          </CsBody>
        </CsSection>


        <CsSection id="cs-logo" label="01 &mdash; Logo" title="Three Elements, One Mark">
          <CsBody>
            <p>The mark had to survive two extremes: 5mm engraving on a glasses temple and large trade-show graphics. Three angled elements form an &ldquo;M&rdquo; that stays legible across engraving, embossing, heat press, and screen print.</p>
            <p>The logomark handles compact placements. The full wordmark handles packaging and marketing. The &ldquo;Powered by MentraOS&rdquo; badge gives third-party makers a compatibility signal.</p>
          </CsBody>
        </CsSection>

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--two">
              <div className="cs-img reveal mentra-brand-logo-stage mentra-brand-logo-stage--light">
                <img {...projectImageProps(`${P}/logo.svg`)} data-project-preview className="mentra-brand-logo-stage__mark" src={`${P}/logo.svg`} alt="Mentra logomark on white" loading="lazy" />
              </div>
              <div className="cs-img reveal mentra-brand-logo-stage mentra-brand-logo-stage--dark">
                <img {...projectImageProps(`${P}/powered-by-badge.png`)} data-project-preview className="mentra-brand-logo-stage__badge" src={`${P}/powered-by-badge.png`} alt="Powered by Mentra badge on dark background" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* 3D logo explorations — the mark as a physical object */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--three">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/logo-3d-green.webp`)} data-project-preview src={`${P}/logo-3d-green.webp`} alt="3D logo: glossy green on white — the primary brand mark rendered as physical object" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/logo-3d-black.webp`)} data-project-preview src={`${P}/logo-3d-black.webp`} alt="3D logo: glossy black on dark — premium variant for dark contexts" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/logo-3d-iridescent.webp`)} data-project-preview src={`${P}/logo-3d-iridescent.webp`} alt="3D logo: iridescent blue crystal — exploration for special editions and events" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* ================================================================
            02 — COLOR & TYPE
            ================================================================ */}
        <CsSection id="cs-color" label="02 &mdash; Color &amp; Type" title="A consistent green across surfaces">
          <CsBody>
            <p>The system uses one green and three neutrals across packaging, product renders, and creator assets. Keeping that palette small makes the different surfaces recognizable as part of the same product.</p>
          </CsBody>
          {/* Swatches */}
          <div className="cs-brand-swatches mentra-brand-swatches" role="list" aria-label="Mentra brand colors">
            <div className="mentra-brand-swatch mentra-brand-swatch--green" role="listitem">
              <span><strong>Mentra Green</strong><small>#00B869</small></span>
            </div>
            <div className="mentra-brand-swatch mentra-brand-swatch--white" role="listitem">
              <span><strong>White</strong><small>#FFFFFF</small></span>
            </div>
            <div className="mentra-brand-swatch mentra-brand-swatch--gray" role="listitem">
              <span><strong>Gray</strong><small>#737373</small></span>
            </div>
            <div className="mentra-brand-swatch mentra-brand-swatch--black" role="listitem">
              <span><strong>Black</strong><small>#0A0A0A</small></span>
            </div>
          </div>
          <div className="mentra-brand-type-note">
          <CsBody>
            <p>Red Hat Display gave the brand a useful balance: geometric enough for tech credibility, soft enough for a consumer hardware product.</p>
          </CsBody>
          </div>
          <div className="cs-label-row mentra-brand-type-spec">
            <span className="cs-label-row-key">Typeface</span>
            <span className="cs-label-row-val">Red Hat Display &mdash; geometric sans-serif</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Headings</span>
            <span className="cs-label-row-val">Bold, 64 / 48 / 32 px</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Body</span>
            <span className="cs-label-row-val">Regular, 18 px, line-height 1.6</span>
          </div>
        </CsSection>

        <CsImage src={`${P}/brand-pattern.png`} alt="Mentra brand pattern: repeating parallelogram texture from logo geometry, used as subtle emboss on packaging" />

        {/* Brand in the wild — YouTubers unboxing the packaging I designed */}
        <CsSection id="cs-wild" label="In the Wild" title="The packaging in public unboxings">
          <CsBody>
            <p>These public unboxing thumbnails show the packaging and charging case in use. They document the shipped objects; they do not establish how reliably new owners completed setup.</p>
          </CsBody>
        </CsSection>

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/yt-unboxing-1.webp`)} data-project-preview src={`${P}/yt-unboxing-1.webp`} alt="YouTube thumbnail: creator holding Mentra Live box and charging case — UNBOXING MENTRA LIVE" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/yt-unboxing-2.webp`)} data-project-preview src={`${P}/yt-unboxing-2.webp`} alt="YouTube thumbnail: creator revealing glasses from box — SMART GLASSES REVEALED" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* Text bubble — messaging UI design for marketing */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img reveal"><img {...projectImageProps(`${P}/text-bubble-1.webp`)} data-project-preview src={`${P}/text-bubble-1.webp`} alt="Mentra marketing asset: lifestyle photo with text bubble UI overlay showing real-time voice transcription — brand language in product context" loading="lazy" /></div>
          </div>
        </section>

        {/* ── Exploded view ── */}
        <CsImage src={`${P}/render-exploded.webp`} alt="Mentra Live exploded view: every internal component — camera, circuit board, battery, speakers, hinges — laid out in assembly order" />

        {/* ================================================================
            04 — INSTRUCTION BOOKLET
            ================================================================ */}
        <CsSection id="cs-manual" label="04 &mdash; Instruction Booklet" title="A QR-led setup guide">
          <CsBody>
            <p>The booklet starts with the only thing a new owner needs first: a QR code to pair and go.</p>
            <p>The rest explains buttons, charging, and fit with custom line art that prints cleanly at 65mm and translates better than photography.</p>
          </CsBody>
        </CsSection>

        {/* Booklet spread */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--three mentra-brand-grid--compact">
              <div className="cs-img reveal mentra-brand-booklet-page"><img {...projectImageProps(`${P}/booklet-page-1.webp`)} data-project-preview src={`${P}/booklet-page-1.webp`} alt="Page 1: QR code and Mentra logo — scan to download app" loading="lazy" /></div>
              <div className="cs-img reveal mentra-brand-booklet-page"><img {...projectImageProps(`${P}/booklet-page-2.webp`)} data-project-preview src={`${P}/booklet-page-2.webp`} alt="Page 2: Line-art illustration of glasses with intro text" loading="lazy" /></div>
              <div className="cs-img reveal mentra-brand-booklet-page"><img {...projectImageProps(`${P}/booklet-page-3.webp`)} data-project-preview src={`${P}/booklet-page-3.webp`} alt="Page 3: Hardware at a glance — 9 labeled components" loading="lazy" /></div>
            </div>
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--two mentra-brand-grid--compact mentra-brand-grid--follow">
              <div className="cs-img reveal mentra-brand-booklet-page"><img {...projectImageProps(`${P}/booklet-page-5.webp`)} data-project-preview src={`${P}/booklet-page-5.webp`} alt="Page 5: Turn on/off — hand holding glasses at power button" loading="lazy" /></div>
              <div className="cs-img reveal mentra-brand-booklet-page"><img {...projectImageProps(`${P}/booklet-page-9.webp`)} data-project-preview src={`${P}/booklet-page-9.webp`} alt="Page 9: Charging case — glasses clicking into place" loading="lazy" /></div>
            </div>
          </div>
        </section>

        <section className="cs-section">
          <div className="wrap">
            <div className="cs-label-row">
              <span className="cs-label-row-key">Size</span>
              <span className="cs-label-row-val">65 &times; 88 mm &mdash; designed to fit the packaging insert cavity exactly</span>
            </div>
            <div className="cs-label-row">
              <span className="cs-label-row-key">Illustration style</span>
              <span className="cs-label-row-val">Line-art, uniform stroke weight, no photography, no color</span>
            </div>
            <div className="cs-label-row">
              <span className="cs-label-row-key">Languages</span>
              <span className="cs-label-row-val">English + French (separate print runs)</span>
            </div>
            <div className="cs-label-row">
              <span className="cs-label-row-key">Print iterations</span>
              <span className="cs-label-row-val">4 rounds &mdash; fold geometry kept breaking at the spine</span>
            </div>
          </div>
        </section>

        {/* ── Editorial portraits with context ── */}
        <CsSection id="cs-photography" label="05 &mdash; Photography" title="Two Shoots, Two Stories">
          <CsBody>
            <p>The Isarelov shoot (February 2026) produced editorial portraits: clean backgrounds, minimal styling, the glasses as everyday eyewear. The studio shoot produced lifestyle context: dark environments, cinematic lighting, the glasses as technology. Both libraries feed the creator guide and social templates.</p>
          </CsBody>
        </CsSection>

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--three">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/editorial-portrait-1.webp`)} data-project-preview src={`${P}/editorial-portrait-1.webp`} alt="Isarelov shoot: model looking right, minimal studio, black frame" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/editorial-portrait-2.webp`)} data-project-preview src={`${P}/editorial-portrait-2.webp`} alt="Isarelov shoot: front-facing, Mentra Live as everyday eyewear" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/editorial-portrait-3.webp`)} data-project-preview src={`${P}/editorial-portrait-3.webp`} alt="Isarelov shoot: button-up shirt, professional context" loading="lazy" /></div>
            </div>
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--three mentra-brand-grid--follow">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/studio-shot-1.webp`)} data-project-preview src={`${P}/studio-shot-1.webp`} alt="Studio shoot: dark urban setting, cinematic lighting" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/studio-shot-2.webp`)} data-project-preview src={`${P}/studio-shot-2.webp`} alt="Studio shoot: product in low-light context" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/studio-shot-3.webp`)} data-project-preview src={`${P}/studio-shot-3.webp`} alt="Studio shoot: lifestyle, technology in daily use" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* Product-in-hand: the real hardware */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--four mentra-brand-grid--compact">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/product-hand-front.webp`)} data-project-preview src={`${P}/product-hand-front.webp`} alt="Hardware in hand: front view, matte finish visible" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/product-hand-angle.webp`)} data-project-preview src={`${P}/product-hand-angle.webp`} alt="Hardware in hand: angle, camera module visible" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/product-folded.webp`)} data-project-preview src={`${P}/product-folded.webp`} alt="Folded glasses from above, hinge detail" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/product-flat.webp`)} data-project-preview src={`${P}/product-flat.webp`} alt="Glasses flat on white surface, symmetry and proportion" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* ================================================================
            06 — SOCIAL & ADS
            ================================================================ */}
        <CsSection id="cs-social" label="06 &mdash; Social &amp; Advertising" title="24 Templates. One System.">
          <CsBody>
            <p>I produced 24 templates across platform sizes and color variants. The logic stayed simple: product anchored left, logo anchored right, text inside safe zones.</p>
          </CsBody>
        </CsSection>

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/cover-twitter-green.png`)} data-project-preview src={`${P}/cover-twitter-green.png`} alt="Twitter/X cover: green variant" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/cover-linkedin-light.png`)} data-project-preview src={`${P}/cover-linkedin-light.png`} alt="LinkedIn cover: light variant" loading="lazy" /></div>
            </div>
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--three mentra-brand-grid--follow">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/cover-youtube-light.webp`)} data-project-preview src={`${P}/cover-youtube-light.webp`} alt="YouTube banner" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/cover-github-light.webp`)} data-project-preview src={`${P}/cover-github-light.webp`} alt="GitHub social preview" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/cover-reddit-light.webp`)} data-project-preview src={`${P}/cover-reddit-light.webp`} alt="Reddit banner" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* Ads */}
        <section className="cs-section">
          <div className="wrap">
            <h3 className="cs-section-subtitle">Ad Campaign: Through the Lens</h3>
            <CsBody>
              <p>Each ad uses the glasses as a frame: one verb, one human moment through the lens, and the Mentra mark at the bottom.</p>
            </CsBody>
          </div>
        </section>

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--four mentra-brand-grid--compact">
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/ad-stream.webp`)} data-project-preview src={`${P}/ad-stream.webp`} alt="Stream Your World — birthday through lens" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/ad-hear.webp`)} data-project-preview src={`${P}/ad-hear.webp`} alt="Hear Your Audio, The World — jogging" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/ad-3.webp`)} data-project-preview src={`${P}/ad-3.webp`} alt="Shipping Soon — teaser on green" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps(`${P}/ad-4.webp`)} data-project-preview src={`${P}/ad-4.webp`} alt="Focus — autofocus UI on portrait" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* ================================================================
            07 — RENDERS (on dark background for drama)
            ================================================================ */}
        <CsSection id="cs-renders" label="07 &mdash; Product Renders" title="Renders for launch and product detail">
          <CsBody>
            <p>I directed three render families that became the visual source for packaging, social, press, and the marketing site. Renders gave us consistent product imagery before every physical variant was ready.</p>
          </CsBody>
        </CsSection>

        {/* Dark section for renders */}
        <section className="cs-section reveal mentra-brand-render-stage">
          <div className="wrap">
            <div className="cs-img reveal mentra-brand-render">
              <img {...projectImageProps(`${P}/render-black-camera.webp`)} data-project-preview className="mentra-brand-render__hero" src={`${P}/render-black-camera.webp`} alt="Black frame: camera module macro, Mentra logo on temple" loading="lazy" />
            </div>
            <div className="cs-img-grid mentra-brand-grid mentra-brand-grid--three mentra-brand-grid--follow">
              <div className="cs-img reveal mentra-brand-render"><img {...projectImageProps(`${P}/render-hinge-detail.webp`)} data-project-preview src={`${P}/render-hinge-detail.webp`} alt="Hinge detail: power button, USB-C" loading="lazy" /></div>
              <div className="cs-img reveal mentra-brand-render"><img {...projectImageProps(`${P}/render-black-temple.webp`)} data-project-preview src={`${P}/render-black-temple.webp`} alt="Temple depth-of-field" loading="lazy" /></div>
              <div className="cs-img reveal mentra-brand-render"><img {...projectImageProps(`${P}/render-black-front.webp`)} data-project-preview src={`${P}/render-black-front.webp`} alt="Front view, dark background" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* ================================================================
            08 — PHYSICAL DETAILS
            ================================================================ */}
        <CsSection id="cs-details" label="08 &mdash; Physical Details" title="5mm Temple. 4 Revision Rounds.">
          <CsBody>
            <p>The 5mm temple mark, FCC markings, case emboss, and lens cloth all had to become production-ready vector instructions. The work was brand design, but also factory communication.</p>
          </CsBody>
          <CsInfoGrid items={[
            { key: 'Temple Logo', value: 'Laser-engraved, 0.3mm stroke outlines' },
            { key: 'Inner Temple', value: 'FCC + model no., single vector artwork' },
            { key: 'Case Lid', value: 'Embossed logomark (not printed)' },
            { key: 'Lens Cloth', value: '150mm, Pantone Black 6 heat press' },
            { key: 'Box Pattern', value: 'Embossed parallelogram texture' },
            { key: 'Frame Variants', value: 'Black (K900) + Clear (Cali 65)' },
          ]} />
        </CsSection>

        <CsImage src={`${P}/glasses-flash.webp`} alt="Mentra Live with flash: matte finish, build quality detail" />

        {/* ================================================================
            REFLECTION
            ================================================================ */}
        <CsSection id="cs-reflection" label="Reflection" title="What Hardware Brand Taught Me">
          <CsBody>
            <p>The hardest consistency work happened in production files: a mark that works on screen still needs separate treatment for engraving, embossing, and heat press. The dielines, label, and booklet make those differences inspectable.</p>
            <p>The packaging reached public unboxings. A measured account of first-use success would need observations of people identifying their variant, finding the QR code, pairing the glasses, and returning them to the charging case. Those results are not included here.</p>
          </CsBody>
        </CsSection>

        <CsSection label="Credits" title="Team">
          <CsCredits credits={[
            { role: 'Brand & Art Direction', name: 'Parth Pawar' },
            { role: 'Company', name: 'Mentra Glass' },
            { role: 'Tools', name: 'Illustrator, Figma, Blender' },
            { role: 'Deliverables', name: 'Logo, packaging, booklet, ads, social, renders, creator guide' },
          ]} />
        </CsSection>

        <div className="mentra-brand-thanks"><CsThanks contactCta /></div>

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-overview', label: 'Overview' },
          { id: 'cs-packaging', label: 'Packaging' },
          { id: 'cs-logo', label: 'Logo' },
          { id: 'cs-color', label: 'Color & Type' },
          { id: 'cs-wild', label: 'In the Wild' },
          { id: 'cs-manual', label: 'Booklet' },
          { id: 'cs-photography', label: 'Photography' },
          { id: 'cs-social', label: 'Social & Ads' },
          { id: 'cs-renders', label: 'Renders' },
          { id: 'cs-details', label: 'Details' },
          { id: 'cs-reflection', label: 'Reflection' },
        ]} />

      </main>

      <NextProject slug="tedx" title="TEDxVITPune" image="/Assets/images/tedx.jpg" />
      <Footer />
    </>
  )
}
