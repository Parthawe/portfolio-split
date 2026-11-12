import { projectImageProps } from '../../utils/projectImage'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsBody from '../../components/case-study/CsBody'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsCallout from '../../components/case-study/CsCallout'
import CsInfoGrid from '../../components/case-study/CsInfoGrid'
import CsNumList from '../../components/case-study/CsNumList'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function ThePointCdcPage() {
  return (
    <>
      <Helmet>
        <title>The Point CDC &middot; Parth Pawar</title>
        <meta name="description" content="Website redesign for The Point CDC in Hunts Point, Bronx, focused on program discovery, WiFi information, events, and mobile navigation." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="The Point CDC · Parth Pawar" />
        <meta property="og:description" content="Website redesign for The Point CDC focused on programs, WiFi access, events, and mobile navigation." />
        <meta property="og:image" content="https://designwhich.works/Assets/mockups/projects/the-point-cdc_16x9.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#1B5EFF' } as React.CSSProperties}>

        <ProjectHeader
          heroFraming="image"
          backLink="/work"
          categorySlug="design-for-good"
          backLabel="Back to Work"
          tags={['UX', 'Community', 'Research']}
          title="The Point CDC"
          subtitle="A community website organized around programs, services, WiFi access, and events"
          info={[
            { label: 'Client', value: 'The Point CDC' },
            { label: 'Scope', value: 'User Research, UI/UX, Prototyping' },
            { label: 'Role', value: 'Product Designer' },
            { label: 'Duration', value: '3 Months' },
            { label: 'Year', value: '2024' },
          ]}
          liveUrl="https://thepoint.org"
          heroImage="/Assets/mockups/projects/the-point-cdc_16x9.webp"
          heroAlt="The Point CDC project cover showing the community website and its interface direction"
        />

        {/* Overview with label-rows */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-label-row">
              <span className="cs-label-row-key">Summary</span>
              <span className="cs-label-row-val">The Point CDC serves Hunts Point through arts, education, environmental work, youth programs, and free WiFi. The redesign made those services easier to find, especially on mobile.</span>
            </div>
            <div className="cs-label-row">
              <span className="cs-label-row-key">Challenge</span>
              <span className="cs-label-row-val">Programs, WiFi information, events, and community initiatives were all important, but the old site made residents work too hard to locate the right next step.</span>
            </div>
            <div className="cs-label-row">
              <span className="cs-label-row-key">Role</span>
              <span className="cs-label-row-val">I handled research synthesis, information architecture, responsive page structure, visual direction, and prototype handoff.</span>
            </div>
            <div className="cs-label-row project-label-row--open">
              <span className="cs-label-row-key">Tools &amp; Techniques</span>
              <span className="cs-label-row-val">
                <span className="cs-tags project-tags--flush">
                  <span className="cs-tag-item">Figma</span>
                  <span className="cs-tag-item">User Research</span>
                  <span className="cs-tag-item">Website Design</span>
                  <span className="cs-tag-item">Prototyping</span>
                  <span className="cs-tag-item">Wireframes</span>
                  <span className="cs-tag-item">High-Fidelity</span>
                  <span className="cs-tag-item">Design System</span>
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* About The Point CDC */}
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-two-col">
              <div>
                <h2 className="cs-display">The Point CDC</h2>
                <CsBody>
                  <p>The Point CDC is a non-profit organization in Hunts Point, Bronx, focused on arts, education, environmental initiatives, free WiFi access, and youth leadership programs.</p>
                </CsBody>
              </div>
              <div className="cs-img">
                <img {...projectImageProps("/Assets/Projects/ThePointCDC/photos/community-photo.webp")} data-project-preview src="/Assets/Projects/ThePointCDC/photos/community-photo.webp" alt="The Point CDC community members at work in Hunts Point" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <CsExpandPreview>
        <section className="cs-section reveal" id="cs-discover">
          <div className="wrap point-callout-wrap">
            <span className="cs-section-label">01 &mdash; Discover</span>
            <h2 className="cs-section-title">Problem Statement</h2>
            <CsCallout className="point-callout">
              <p>How can we redesign The Point CDC&rsquo;s website so residents can find programs, services, events, and WiFi information faster?</p>
            </CsCallout>
          </div>
        </section>

        {/* User Research */}
        <section className="cs-section reveal">
          <div className="wrap">
            <span className="cs-section-label">02 &mdash; Discover</span>
            <h2 className="cs-section-title">User Research</h2>
            <CsBody>
              <p>I focused on understanding how the website could best serve the Hunts Point community. Residents emphasized the need for:</p>
            </CsBody>
            <div className="point-research-list">
              <CsFeatureGrid features={[
                { title: 'Easy access to WiFi service information.', desc: '' },
                { title: 'Clear communication about events and programs.', desc: '' },
                { title: 'Mobile-friendly navigation, as many users rely on their phones for internet access.', desc: '' },
              ]} />
            </div>
          </div>
        </section>

        {/* User Persona */}
        <section className="cs-section reveal">
          <div className="wrap">
            <span className="cs-section-label">Interview</span>
            <h2 className="cs-section-title">Primary User Lens</h2>
            <CsInfoGrid items={[
              { key: 'User', value: 'Resident or community organizer' },
              { key: 'Need', value: 'Find services, events, and WiFi information quickly' },
              { key: 'Context', value: 'Often mobile-first, sometimes helping someone else' },
              { key: 'Risk', value: 'Important resources become invisible when navigation is unclear' },
            ]} />
            <h3 className="cs-section-subtitle">Goals</h3>
            <ul className="cs-list">
              <li>Access community resources like WiFi and mentorship programs without digging through the site.</li>
              <li>Stay updated on local initiatives and events hosted by The Point CDC.</li>
              <li>Use the website while helping someone else connect with resources.</li>
            </ul>
            <h3 className="cs-section-subtitle">Frustrations</h3>
            <ul className="cs-list">
              <li>Difficulty finding information on the old website due to cluttered layout.</li>
              <li>Poor mobile hierarchy made resource discovery slower than it needed to be.</li>
              <li>Lack of a centralized location for event updates, leading to missed community activities.</li>
            </ul>
          </div>
        </section>

        {/* Key Insights */}
        <section className="cs-section reveal">
          <div className="wrap">
            <span className="cs-section-label">Key Insights</span>
            <h2 className="cs-section-title">Research Insights</h2>
            <CsNumList items={[
              <><strong>WiFi needed a faster path.</strong> Free Hunts Point WiFi was one of the clearest high-value resources, so it needed to be findable without navigation guesswork.</>,
              <><strong>Mobile hierarchy mattered most.</strong> The redesign had to work for residents browsing quickly on phones, not only desktop visitors.</>,
              <><strong>Programs needed clearer grouping.</strong> Events, youth programs, and initiatives needed a structure residents could scan without knowing the organization&rsquo;s internal categories.</>,
            ]} />
          </div>
        </section>

        {/* Visual Improvements */}
        <section className="cs-section reveal">
          <div className="wrap">
            <span className="cs-section-label">Discover</span>
            <h2 className="cs-section-title">Visual Improvements</h2>
            <CsBody>
              <p>The navigation decision was to surface free WiFi, programs, and events as recognizable destinations. The comparison below shows the old structure and the areas targeted for change; the later screens show grouped navigation and program cards.</p>
            </CsBody>
            <ul className="cs-list">
              <li><strong>Simplify Navigation:</strong> Reduce menu clutter by grouping items under broader categories.</li>
              <li><strong>Reduce Visual Clutter:</strong> Remove competing layout elements so essential information is easier to scan.</li>
              <li><strong>Refine Color Scheme:</strong> Use a cohesive color palette that aligns with the community mission.</li>
              <li><strong>Highlight Key Programs:</strong> Use icons or banners to make important resources more visible.</li>
            </ul>
          </div>
        </section>

        <div className="cs-slide cs-slide--point-visual reveal">
          <img {...projectImageProps("/Assets/Projects/ThePointCDC/Desktop/slice-5.webp")} data-project-preview src="/Assets/Projects/ThePointCDC/Desktop/slice-5.webp" alt="Before and after visual comparison of the old website with annotated improvement areas" loading="lazy" />
        </div>

        {/* Goals */}
        <section className="cs-section reveal project-section--flush" id="cs-define">
          <div className="wrap">
            <span className="cs-section-label">Define</span>
            <h2 className="cs-section-title">Goals</h2>
            <CsFeatureGrid features={[
              { title: 'Improve Accessibility', desc: 'Make key pages easy to scan and navigate for community members, including mobile visitors.' },
              { title: 'Highlight Key Programs', desc: 'Make free WiFi, events, and community initiatives easy to reach from the homepage.' },
              { title: 'Support Updates', desc: 'Give staff clearer places to publish current program information and announcements.' },
            ]} />
          </div>
        </section>

        {/* User Journey */}
        <section className="cs-section reveal project-section--flush">
          <div className="wrap">
            <span className="cs-section-label">Define</span>
            <h2 className="cs-section-title">User Journey</h2>
            <div className="point-board-stack point-board-stack--journey" aria-label="User journey map and information architecture flow diagram">
              <figure className="point-board-panel point-board-panel--goals">
                <img {...projectImageProps("/Assets/Projects/ThePointCDC/Desktop/slice-6.webp")} data-project-preview src="/Assets/Projects/ThePointCDC/Desktop/slice-6.webp" alt="Goal mapping for accessibility, key programs, and community engagement" loading="lazy" />
                <figcaption>Goals translated into site priorities.</figcaption>
              </figure>
              <figure className="point-board-panel point-board-panel--journey">
                <img {...projectImageProps("/Assets/Projects/ThePointCDC/Desktop/slice-6.webp")} data-project-preview src="/Assets/Projects/ThePointCDC/Desktop/slice-6.webp" alt="User journey map and information architecture flow diagram" loading="lazy" />
                <figcaption>User journey and information architecture, enlarged for reading.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Visual Style */}
        <section className="cs-section reveal" id="cs-develop">
          <div className="wrap">
            <span className="cs-section-label">Develop</span>
            <h2 className="cs-section-title">Setting Visual Style</h2>
            <CsBody>
              <p>A comprehensive design system was established covering typography, buttons, sections, colors, tags, icons, and menu components to ensure consistency across the entire website.</p>
            </CsBody>
          </div>
        </section>

        <div className="cs-slide cs-slide--point-style reveal">
          <img {...projectImageProps("/Assets/Projects/ThePointCDC/Desktop/slice-8.webp")} data-project-preview src="/Assets/Projects/ThePointCDC/Desktop/slice-8.webp" alt="Design system components, typography, buttons, colors, tags, icons, sections, and menu" loading="lazy" />
        </div>

        {/* Visuals & Prototyping */}
        <section className="cs-section reveal" id="cs-deliver">
          <div className="wrap">
            <span className="cs-section-label">Deliver</span>
            <h2 className="cs-section-title">Visuals &amp; Prototyping</h2>
            <div className="point-board-stack point-board-stack--redesign" aria-label="Annotated redesign showing grouped navigation, responsive layout, improved readability, and cohesive color scheme">
              <figure className="point-board-panel point-board-panel--redesign-top">
                <img {...projectImageProps("/Assets/Projects/ThePointCDC/photos/homepage-hero.png")} data-project-preview src="/Assets/Projects/ThePointCDC/photos/homepage-hero.png" alt="Redesigned homepage hero with grouped navigation and clear community entry points" loading="lazy" />
                <figcaption>Grouped navigation and clearer entry points.</figcaption>
              </figure>
              <figure className="point-board-panel point-board-panel--redesign-mid">
                <img {...projectImageProps("/Assets/Projects/ThePointCDC/photos/all-pages-mockup.webp")} data-project-preview src="/Assets/Projects/ThePointCDC/photos/all-pages-mockup.webp" alt="Angled overview of the redesigned program, team, partnership, and resource pages" loading="lazy" />
                <figcaption>Programs surfaced as scan-friendly cards.</figcaption>
              </figure>
              <figure className="point-board-panel point-board-panel--redesign-bottom">
                <img {...projectImageProps("/Assets/Projects/ThePointCDC/photos/responsive-preview.png")} data-project-preview src="/Assets/Projects/ThePointCDC/photos/responsive-preview.png" alt="Responsive desktop and mobile views of The Point CDC website" loading="lazy" />
                <figcaption>Mobile and footer structure made easier to follow.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="cs-section reveal">
          <div className="wrap">
            <div className="cs-img-grid project-image-grid--two">
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/ThePointCDC/photos/annotated-redesign.webp")} data-project-preview src="/Assets/Projects/ThePointCDC/photos/annotated-redesign.webp" alt="Annotated redesign explaining the new homepage hierarchy and navigation" loading="lazy" /></div>
              <div className="cs-img reveal"><img {...projectImageProps("/Assets/Projects/ThePointCDC/photos/community-photo-2.png")} data-project-preview src="/Assets/Projects/ThePointCDC/photos/community-photo-2.png" alt="Community engagement at The Point CDC" loading="lazy" /></div>
            </div>
          </div>
        </section>

        {/* Reflections */}
        <section className="cs-section reveal" id="cs-reflections">
          <div className="wrap">
            <p className="cs-section-label">Reflections</p>
            <h2 className="cs-section-title cs-section-title--wide">What Community-Centered Design Taught Me</h2>
            <CsNumList items={[
              <><strong>Deep listening beats designer instincts.</strong> Designing for a community you are not part of requires listening, not assumptions. Every interview and site visit reminded me that my instincts about what residents needed were often wrong until I sat down and actually heard their stories.</>,
              <><strong>Mobile-first is a lived reality, not a buzzword.</strong> Phone-only access shaped the layout, interactions, and content hierarchy. The public record does not include a method or source for a precise share of phone-only users. This project made mobile-first thinking a non-negotiable part of my design process.</>,
              <><strong>Balance institutional messaging with genuine utility.</strong> The tension between what a non-profit organization wants to communicate and what community members actually need to find was one of the hardest design challenges. Prioritizing user tasks over organizational messaging led to a site that served both goals more effectively.</>,
              <><strong>Accessibility raises the bar for everyone.</strong> Designing for accessibility forced better design decisions overall &mdash; clearer typography, simpler navigation, and stronger visual hierarchy benefited every single user, not just those with specific needs.</>,
            ]} />
          </div>
        </section>

        {/* Outcome */}
        <section className="cs-section reveal" id="cs-results">
          <div className="wrap">
            <span className="cs-section-label">Outcome</span>
            <h2 className="cs-section-title">The Site Is Live</h2>
            <CsBody>
              <p>The final site gave programs, events, WiFi access, and community resources a clearer public structure that residents and staff could point people toward.</p>
            </CsBody>
            <a href="https://thepoint.org" target="_blank" rel="noopener noreferrer" className="cs-thanks-btn point-thanks-link">
              Visit thepoint.org
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
        </section>

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-discover', label: 'Discover' },
          { id: 'cs-define', label: 'Define' },
          { id: 'cs-develop', label: 'Develop' },
          { id: 'cs-deliver', label: 'Deliver' },
          { id: 'cs-reflections', label: 'Reflections' },
          { id: 'cs-results', label: 'Outcome' },
        ]} liveUrl="https://thepoint.org" />

      </main>

        <NextProject slug="office-of-diversity" title="Office of Diversity" image="/Assets/mockups/projects/office-of-diversity_16x9.webp" />
      <Footer />
    </>
  )
}
