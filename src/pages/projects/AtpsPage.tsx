import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import ProjectOverview from '../../components/case-study/ProjectOverview'
import CsBody from '../../components/case-study/CsBody'
import CsCallout from '../../components/case-study/CsCallout'
import CsImage from '../../components/case-study/CsImage'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function AtpsPage() {
  return (
    <>
      <Helmet>
        <title>ATPS &middot; Parth Pawar</title>
        <meta name="description" content="ArtTown Podcast Series (ATPS), a weekly podcast hosted by Parth Pawar, featuring 40+ conversations with art and design professionals worldwide. Conversations about creative practice and careers." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="ATPS · Parth Pawar" />
        <meta property="og:description" content="ArtTown Podcast Series, An archive of conversations with art and design professionals, with original episode artwork." />
        <meta property="og:image" content="https://designwhich.works/Assets/images/atps.webp" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main project-main--atps" style={{ '--project-color': '#7A6FF0' } as React.CSSProperties}>

        <ProjectHeader
          showHeaderSummary={false}
          backLink="/work"
          categorySlug="brand-visual"
          backLabel="Back to Work"
          tags={['Podcast', 'Content', 'Art & Design']}
          title="ArtTown Podcast Series"
          subtitle="Conversations with art and design professionals about their work, practice, and careers."
          info={[
            { label: 'Year', value: '2020 \u2013 2021 archive' },
            { label: 'Role', value: 'Podcast Host' },
            { label: 'Platforms', value: 'Spotify, Apple Podcast, Google Podcast' },
          ]}
        />

        {/* Hero image */}
        <CsImage src="/Assets/Projects/ATPS/Desktop/1.jpg" alt="Original ArtTown Podcast Series artwork with microphone and episode covers" caption="Original series artwork. Audience totals shown in archived graphics are historical, not current analytics." />

        {/* Distribution */}
        <section className="cs-section reveal" id="cs-distribution">
          <div className="wrap">
            <p className="cs-section-label">Distribution</p>
            <h2 className="cs-display">Original distribution</h2>
            <p className="cs-caption">Platforms listed in the original project record. A separate listening draft contains 45 recovered episode records and audio links; current host availability still needs verification.</p>
            <div className="cs-tags atps-platforms">
              <span className="cs-tag-item">Google Podcast</span>
              <span className="cs-tag-item">Podcast Addict</span>
              <span className="cs-tag-item">Spotify</span>
              <span className="cs-tag-item">Apple Podcast</span>
              <span className="cs-tag-item">Pocket Casts</span>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="cs-section reveal" id="cs-overview">
          <div className="wrap">
            <div className="atps-overview-head">
              <h2 className="cs-display">ArtTown Podcast Series</h2>
              <div className="atps-overview-meta">
                <strong>Podcast Host</strong>
                <span>Recovered episodes: 2020 &ndash; November 2021</span>
              </div>
            </div>
            <ProjectOverview
              sections={[
                {
                  label: 'Summary',
                  content: 'I hosted conversations with art and design professionals about their practices and career paths. The original series followed a weekly release schedule.',
                },
                {
                  label: 'Audience',
                  content: 'I started the Podcast series with the vision of helping young people understand and learn about multiple career opportunities in the Art and Design world by interviewing Industry experts all over the world.',
                },
                {
                  label: 'Archive',
                  content: 'The series brought together 40+ conversations with people working across art and design. Audience figures below are historical self-reported totals, not current analytics.',
                },
              ]}
            />
          </div>
        </section>

        <CsExpandPreview>
        {/* Stats */}
        <section className="cs-section reveal" id="cs-impact">
          <div className="wrap">
            <p className="cs-section-label">Archive totals</p>
            <p className="cs-caption">Historical self-reported figures. The reporting period and platform export are not included, so these should not be read as current reach or comparable performance metrics.</p>
            <div className="cs-info-grid atps-impact-grid">
              <div className="cs-info-item">
                <span className="cs-info-value">50k+</span>
                <span className="cs-info-key">Views</span>
              </div>
              <div className="cs-info-item">
                <span className="cs-info-value">40+</span>
                <span className="cs-info-key">Guests</span>
              </div>
              <div className="cs-info-item">
                <span className="cs-info-value">18,000</span>
                <span className="cs-info-key">Listening hours</span>
              </div>
            </div>
          </div>
        </section>

        {/* Plan of Action */}
        <section className="cs-section reveal" id="cs-process">
          <div className="wrap">
            <h2 className="cs-display atps-centered-heading">Preparing and producing each conversation</h2>
            <div className="cs-steps atps-process">
              <div className="cs-step">
                <div className="cs-step-title">Problem</div>
                <div className="cs-step-desc">Educating Young Minds</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-title">Discover</div>
                <div className="cs-step-desc">Art &amp; Design Domain</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-title">Define</div>
                <div className="cs-step-desc">Contact experts from domain</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-title">Develop</div>
                <div className="cs-step-desc">Connection &amp; Preparation before shoot</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-title">Deliver</div>
                <div className="cs-step-desc">Podcast shoot &amp; Post Editing</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-title">Solution</div>
                <div className="cs-step-desc">Informative Podcast</div>
              </div>
            </div>
          </div>
        </section>

        {/* Guest Connections */}
        <section className="cs-section reveal" id="cs-guests">
          <div className="wrap">
            <h2 className="cs-display atps-centered-heading">Guest Connections</h2>
            <div className="atps-centered-copy"><CsBody>
              <p>Over 40 episodes, we connected with a diverse range of guests including product designers, architects, art directors, brand developers, glass sculptors, tattoo artists, art conservators, and more from around the world.</p>
            </CsBody></div>
          </div>
        </section>

        {/* How It Works */}
        <section className="cs-section reveal" id="cs-listener-flow">
          <div className="wrap">
            <p className="cs-section-label atps-centered-heading">Listener Experience</p>
            <h2 className="cs-section-title atps-centered-heading">How It Works</h2>
            <div className="cs-steps atps-listener-flow">
              <div className="cs-step">
                <div className="cs-step-num">01</div>
                <div className="cs-step-title">Reveal</div>
                <div className="cs-step-desc">Discover a new guest and episode topic</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-num">02</div>
                <div className="cs-step-title">Play</div>
                <div className="cs-step-desc">Stream the episode on your preferred platform</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-num">03</div>
                <div className="cs-step-title">Enjoy</div>
                <div className="cs-step-desc">Gain insights from industry experts</div>
              </div>
              <div className="cs-step">
                <div className="cs-step-num">04</div>
                <div className="cs-step-title">Repeat</div>
                <div className="cs-step-desc">The original release schedule was weekly</div>
              </div>
            </div>
            <div className="atps-callout"><CsCallout>
              <p><strong>Original release format</strong></p>
              <div className="cs-callout-metric-grid atps-callout-grid">
                <div>
                  <small>What you gain</small>
                  <strong>Art</strong>
                </div>
                <div>
                  <small>Release day</small>
                  <strong>Friday</strong>
                </div>
                <div>
                  <small>Cost</small>
                  <strong>Free</strong>
                </div>
              </div>
            </CsCallout></div>
          </div>
        </section>

        {/* Episode grid */}
        <CsImage src="/Assets/Projects/ATPS/Desktop/5.webp" alt="Full episode grid of the ArtTown Podcast Series with guest thumbnails and descriptions" caption="Archived episode artwork. This image documents the series; it is not a playable episode directory." />

        {/* Notable Guests */}
        <section className="cs-section reveal" id="cs-episodes">
          <div className="wrap">
            <p className="cs-section-label">Episodes</p>
            <h2 className="cs-section-title">Notable Guests</h2>
            <div className="atps-episodes-intro"><CsBody>
              <p>The series featured conversations spanning a wide breadth of creative disciplines:</p>
            </CsBody></div>
            <ul className="cs-list">
              <li>Srishti Bajaj &mdash; Product Designer</li>
              <li>Narendra Rahurikar &mdash; Art Director, Managing Director at Crime Art</li>
              <li>Romain Girard &mdash; Senior Head of Innovation at Puma Global</li>
              <li>Indranit &amp; Nita Kembhavi &mdash; Architects</li>
              <li>Peter Bremers &mdash; Glass Sculptor</li>
              <li>Allan Gois &mdash; Tattoo Artist</li>
              <li>Priya Kapoor &mdash; Art Conservator</li>
              <li>Phillip J. Clayton &mdash; Brand Development and Marketing</li>
              <li>Latoya Flowers &mdash; Media Producer, Projection Mapping Artist</li>
              <li>Paul Sandip &mdash; Innovator of 700+ Products</li>
              <li>Rohit Lalwani &mdash; Startups &amp; Design</li>
              <li>Gopi Kukade &mdash; Advertising Veteran</li>
              <li>Shekhar Badve &mdash; Creative Leader, Head of Product Evolution &amp; Branding</li>
              <li>Bijay Biswal &mdash; Indian Artist</li>
              <li>Aarzoo Khurana &mdash; Featured Guest</li>
            </ul>
          </div>
        </section>

        {/* Reflections */}
        <section className="cs-section reveal" id="cs-reflections">
          <div className="wrap">
            <p className="cs-section-label">Reflections</p>
            <h2 className="cs-section-title">What Hosting 40+ Conversations Taught Me</h2>
            <div className="atps-reflection-copy"><CsBody>
              <p>Running ATPS taught me that the best interviews happen when you stop performing expertise and start listening. The turning point was following a guest&rsquo;s unexpected tangent instead of forcing the script.</p>
              <p>The design skill I developed was editorial thinking&mdash;knowing what to cut, what to keep, and how to structure a 60-minute conversation into a compelling 30-minute episode. This is the same skill I now use in product design: understanding that what you leave out defines the experience as much as what you include.</p>
              <p>ATPS also gave me a network I could not have built any other way. Several professional collaborations&mdash;including introductions that led to real projects&mdash;started as podcast conversations.</p>
            </CsBody></div>
          </div>
        </section>

        </CsExpandPreview>

        <BottomNav
          sections={[
            { id: 'cs-overview', label: 'Overview' },
            { id: 'cs-impact', label: 'Impact' },
            { id: 'cs-process', label: 'Process' },
            { id: 'cs-listener-flow', label: 'Experience' },
            { id: 'cs-episodes', label: 'Guests' },
            { id: 'cs-reflections', label: 'Reflections' },
          ]}
        />

        <CsThanks />

      </main>

      <NextProject slug="mentra" title="Mentra" image="/Assets/images/mentra.webp" />
      <Footer />
    </>
  )
}
