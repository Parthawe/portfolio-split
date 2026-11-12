import CsReportReader from '../../components/case-study/CsReportReader'
import { projectImageProps } from '../../utils/projectImage'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function VishwaConclavePage() {
  return (
    <>
      <Helmet>
        <title>VishwaConclave &middot; Parth Pawar</title>
        <meta name="description" content="Creative direction, branding, and web design for VishwaConclave, a multidisciplinary student-led conference. From Junior Designer to Creative Director over three years." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="VishwaConclave · Parth Pawar" />
        <meta property="og:description" content="Creative direction, branding, and web design for a multidisciplinary student-led conference." />
        <meta property="og:image" content="https://designwhich.works/Assets/Projects/VishwaConclave/1.jpg" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#7B2FBF' } as React.CSSProperties}>

        <ProjectHeader
          heroFraming="image"
          backLink="/work"
          categorySlug="brand-visual"
          backLabel="Back to Work"
          tags={['Brand', 'Creative Direction', 'Web Design']}
          showHeaderSummary={false}
          heroImage="/Assets/Projects/VishwaConclave/1.jpg"
          heroAlt="VishwaConclave identity and event posters across 2019–2021"
          title="VishwaConclave"
          subtitle="Conference identity and event work across the 2019–2021 editions, from junior designer to creative director."
          info={[
            { label: 'Duration', value: 'Dec 2019 – May 2021' },
            { label: 'Role', value: 'Junior designer → Creative director' },
            { label: 'Organization', value: 'Vishwakarma Institute of Technology, Pune' },
          ]}
        />

        {/* Overview */}
        <CsSection id="cs-overview" label="Overview" title="From individual assets to creative direction">
          <CsBody>
            <p>VishwaConclave is a multidisciplinary student-led conference organized by students at Vishwakarma Institute of Technology, Pune. The event brings speakers from different fields into conversation with the student community, so the design system had to make each theme feel distinct while still belonging to one larger platform.</p>
            <p>I joined as a Junior Designer in 2019. Across three years and five events, I grew into Creative Director for marketing, social, aesthetics, design, and web.</p>
            <p>What started with speaker cards became ownership of the full identity across campaigns, merchandise, recruitment, video, and digital experiences.</p>
          </CsBody>
        </CsSection>

        <CsExpandPreview
          cta="Open the campaign archive"
          note="Event timeline, identity systems, campaign assets, scope, growth notes, and final sign-off."
        >
        <section id="cs-events" className="cs-section"><div className="wrap"><h2 className="cs-section-title">Three years of an evolving identity</h2><CsBody><p>Choose an edition, inspect its complete board, then zoom or enter fullscreen to read the artwork. The original boards document the shift from individual campaigns to creative direction across an event.</p></CsBody>
        <CsReportReader label="VishwaConclave edition archive" continueHref="#cs-scope" originalLabel="Open selected original board" chapters={[
          {label:'2019 · Narrative and Revisit',src:'/Assets/Projects/VishwaConclave/2.jpg',alt:'2019 Narrative podcast and Revisit campaign artwork'},
          {label:'2020 · Crafting the Decade',src:'/Assets/Projects/VishwaConclave/4.jpg',alt:'2020 conference campaigns and recruitment artwork'},
          {label:'2021 · Accelerate the Paradigm Shift',src:'/Assets/Projects/VishwaConclave/5.webp',alt:'2021 campaigns, website, collateral and merchandise'}
        ]}/></div></section>

        {/* Scope */}
        <CsSection id="cs-scope" label="02 &mdash; Scope" title="The scope of creative direction">
          <CsBody>
            <p>By the final event, creative direction meant owning every touchpoint the audience encountered. The scope included:</p>
            <ul className="cs-list">
              <li><strong>Domain design</strong> &mdash; visual identity for each event theme, from typography to color systems</li>
              <li><strong>Video production</strong> &mdash; speaker announcement reels, event trailers, recap films</li>
              <li><strong>Website &amp; development</strong> &mdash; responsive event site with countdown timers, speaker bios, and registration flows</li>
              <li><strong>Social media campaigns</strong> &mdash; speaker reveal cards, story templates, engagement formats</li>
              <li><strong>Sponsorship collateral</strong> &mdash; Amazon Prime partnership campaign assets</li>
              <li><strong>Merchandise</strong> &mdash; event t-shirts, stickers, branded materials</li>
              <li><strong>Recruitment</strong> &mdash; visual system for 8 team departments (Aesthetics, Curation, Finance, Multimedia, PR &amp; Branding, Research &amp; Curation, Sponsorship, Video Editing)</li>
            </ul>
            <p>Building a team recruitment system was an unexpected design challenge. Each of the eight departments needed its own visual identity within the larger VishwaConclave brand &mdash; distinct enough to attract the right people, cohesive enough to feel like one organization.</p>
          </CsBody>
        </CsSection>

        {/* Growth */}
        <CsSection id="cs-growth" label="03 &mdash; Growth" title="Junior Designer to Creative Director">
          <CsBody>
            <p>I started by making individual assets, then gradually took responsibility for the system around them: campaign direction, social media, event aesthetics, design operations, and the website. The shift was not just more output; it was learning how to make a team move with one visual language.</p>
            <p>That progression taught me that design leadership is less about making every artifact personally and more about building a clear system that lets other people create consistently.</p>
          </CsBody>
        </CsSection>

        {/* Signing off */}
        <section className="cs-slide reveal">
          <div className="wrap">
            <img {...projectImageProps("/Assets/Projects/VishwaConclave/6.jpg")} data-project-preview src="/Assets/Projects/VishwaConclave/6.jpg" alt="Creative Director signing off — Parth Pawar in VishwaConclave merchandise" loading="lazy" />
          </div>
        </section>

        <CsThanks />

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-overview', label: 'Overview' },
          { id: 'cs-events', label: 'Events' },
          { id: 'cs-scope', label: 'Scope' },
          { id: 'cs-growth', label: 'Growth' },
        ]} />

      </main>

      <NextProject slug="mentra" title="Mentra" image="/Assets/mockups/projects/mentra_16x9.webp" />
      <Footer />
    </>
  )
}
