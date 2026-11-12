import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import CategoryHeroArtifact from '../components/CategoryHeroArtifact'
import { Reveal } from '../components/Reveal'
import { CONTACT_EMAIL } from '../config/site'
import '../styles/ux-research.css'

type ResearchCase = {
  slug: string
  title: string
  context: string
  year: string
  image: string
  imageAlt: string
  evidence: string
  methods: string[]
  decision: string
  boundary: string
}

const researchCases: ResearchCase[] = [
  {
    slug: 'medimorpho',
    title: 'NYU Langone',
    context: 'Multilingual healthcare communication',
    year: '2024',
    image: '/Assets/Projects/MediMorpho/nyu-langone-building-clear.webp',
    imageAlt: 'NYU Langone Health building signage, the context for the healthcare research study.',
    evidence: '20 primary interviews: 16 non-native speakers with U.S. care experience and 4 healthcare professionals. The team consolidated the evidence into four affinity themes.',
    methods: ['Decision framing', '20 interviews', 'Secondary research', 'Affinity mapping', 'Journey mapping', 'Technical opportunity scan'],
    decision: 'The research moved the concept away from translation as a single feature and toward a shared encounter model: language identification, live understanding, and a clear post-visit recap.',
    boundary: 'Five-person NYU team. The full synthesized case and supplied artifacts are public; participant identities and raw notes remain private.',
  },
  {
    slug: 'raahi-project',
    title: 'Raahi',
    context: 'Public-transit service research',
    year: '2022',
    image: '/Assets/mockups/projects/raahi-project_16x9.webp',
    imageAlt: 'Raahi public-transit service across mobile and physical touchpoints.',
    evidence: 'Rider archetypes, journey models, and a service blueprint exposed breakdowns across planning, stops, vehicles, route information, and wayfinding—not as isolated screens.',
    methods: ['Decision framing', 'Problem-space mapping', 'Rider archetypes', 'Journey models', 'Service blueprint', 'Information architecture'],
    decision: 'The product direction became one connected journey spanning digital and physical touchpoints, with continuity as the central service requirement.',
    boundary: 'Two-designer concept study. The available record does not preserve a defensible participant count or measured live-service outcome, and the case says so directly.',
  },
  {
    slug: 'vj-software',
    title: 'VJ Parivar',
    context: 'Residential parking decisions',
    year: '2022',
    image: '/Assets/mockups/projects/vj-software_16x9.webp',
    imageAlt: 'VJ Parivar residential product and parking-selection experience.',
    evidence: 'Two resident personas exposed that parking was a spatial, high-consequence choice hidden inside a generic administrative workflow.',
    methods: ['User research', 'Personas', 'Task analysis', 'Journey mapping', 'Prototype validation'],
    decision: 'The booking flow became map-first so residents could understand the physical choice before committing to a parking spot.',
    boundary: 'Client project completed with UX lead Akshita Anand; research inputs and product decisions are presented without inflating the study size.',
  },
  {
    slug: 'cuetv',
    title: 'CueTV',
    context: 'Arts-streaming audience discovery',
    year: '2021',
    image: '/Assets/mockups/projects/cuetv_16x9.webp',
    imageAlt: 'CueTV streaming platform across television, laptop, tablet, and phone.',
    evidence: 'Audience research showed that opera, ballet, and classical viewers browse with specialist intent that generic entertainment categories and growth patterns do not support.',
    methods: ['Audience research', 'Browsing analysis', 'Content architecture', 'Journey mapping', 'Growth-system strategy'],
    decision: 'The platform direction paired precise arts discovery with a repeatable retargeting system, connecting browsing behavior to re-engagement instead of treating them as separate problems.',
    boundary: 'Client product work completed with product and growth stakeholders. Public material shows the platform strategy while client-sensitive research detail remains limited.',
  },
]

const leadershipSignals = [
  {
    num: '01',
    title: 'Frame the decision',
    body: 'Begin with the product or service decision the team must make, then define the questions and evidence needed to reduce uncertainty.',
    proof: 'NYU Langone · Raahi',
  },
  {
    num: '02',
    title: 'Choose methods deliberately',
    body: 'Match interviews, field inquiry, task analysis, content audits, journey models, or usability checks to the question—not to a fixed process.',
    proof: 'Four different research contexts',
  },
  {
    num: '03',
    title: 'Work across the study loop',
    body: 'Connect framing, participant inquiry, analysis, synthesis, reporting, and the next validation question while making individual and team ownership explicit.',
    proof: 'NYU Langone · Raahi',
  },
  {
    num: '04',
    title: 'Make synthesis inspectable',
    body: 'Use affinity themes, journeys, service maps, and decision records so collaborators can see how evidence became a recommendation.',
    proof: 'Evidence → theme → decision',
  },
  {
    num: '05',
    title: 'Influence product direction',
    body: 'Research is complete when it changes priorities, interaction models, information architecture, or the roadmap—not when the deck is delivered.',
    proof: 'Map-first parking · connected transit',
  },
  {
    num: '06',
    title: 'Validate and measure',
    body: 'Return to concepts with task-based evaluation, accessibility checks, responsive validation, and explicit experience-quality signals.',
    proof: 'VJ Parivar · CueTV',
  },
]

const lifecycle = [
  ['01', 'Align', 'Clarify the business decision, user risk, known evidence, stakeholders, and learning deadline.'],
  ['02', 'Plan', 'Select the smallest credible method mix; define participants, tasks, consent, logistics, and analysis criteria.'],
  ['03', 'Learn', 'Moderate without leading, document context and behavior, and preserve the difference between observation and interpretation.'],
  ['04', 'Synthesize', 'Triangulate signals into themes, journeys, needs, tensions, and opportunity areas with traceable source evidence.'],
  ['05', 'Decide', 'Translate findings into product recommendations, prioritization choices, and artifacts each partner can use.'],
  ['06', 'Validate', 'Test the riskiest assumptions, define experience-quality signals, and feed results into the next research cycle.'],
] as const

function ResearchCaseCard({ study, featured = false }: { study: ResearchCase; featured?: boolean }) {
  return (
    <article className={`uxr-case${featured ? ' uxr-case--featured' : ''}`}>
      <Link to={`/${study.slug}`} className="uxr-case__media figma-hover" aria-label={`View ${study.title} research case study`}>
        <img src={study.image} alt={study.imageAlt} loading={featured ? 'eager' : 'lazy'} />
        <span>{study.context}</span>
        <b>{study.year}</b>
      </Link>
      <div className="uxr-case__body">
        <div className="uxr-case__title">
          <p>{featured ? 'Flagship research study' : 'Selected research study'}</p>
          <h3><Link to={`/${study.slug}`}>{study.title}</Link></h3>
        </div>
        <dl className="uxr-case__evidence">
          <div><dt>Evidence</dt><dd>{study.evidence}</dd></div>
          <div><dt>Decision changed</dt><dd>{study.decision}</dd></div>
          <div><dt>Scope boundary</dt><dd>{study.boundary}</dd></div>
        </dl>
        <ul className="uxr-case__methods" aria-label={`${study.title} research methods`}>
          {study.methods.map((method) => <li key={method}>{method}</li>)}
        </ul>
        <Link to={`/${study.slug}`} className="uxr-case__link figma-hover">Read the case study <span aria-hidden="true">↗</span></Link>
      </div>
    </article>
  )
}

export default function UxResearchPage() {
  return (
    <div className="uxr-page category-page">
      <Helmet>
        <title>UX Research · Parth Pawar</title>
        <meta name="description" content="Two in-depth UX research case studies in multilingual healthcare and public transit, supported by additional product research work." />
        <meta property="og:title" content="UX Research · Parth Pawar" />
        <meta property="og:description" content="Two in-depth UX research case studies showing framing, methods, synthesis, decisions, collaboration boundaries, and limitations." />
        <link rel="canonical" href="https://designwhich.works/ux-research" />
      </Helmet>
      <Nav />
      <main id="main-content" className="uxr-main">
        <div className="wrap">
          <section className="uxr-hero">
            <p className="uxr-eyebrow"><i aria-hidden="true" /> UX Research</p>
            <div className="uxr-hero__copy">
              <span>Research<br />Strategy</span>
              <h1>Research that turns complex systems into decisions teams can act on.</h1>
              <p>I frame studies around the decision at risk, choose methods for the question, and carry evidence through synthesis, product direction, and validation.</p>
            </div>
            <div className="uxr-hero__artifact" aria-hidden="true"><CategoryHeroArtifact slug="ux-research" /></div>
            <div className="uxr-hero__bottom">
              <a href="#research-work" className="uxr-button figma-hover">See research <span aria-hidden="true">↓</span></a>
              <dl>
                <div><dt>02</dt><dd>In-depth case studies</dd></div>
                <div><dt>20</dt><dd>Primary interviews</dd></div>
                <div><dt>Generative + evaluative</dt><dd>Research range</dd></div>
              </dl>
            </div>
          </section>

          <Reveal>
            <section className="uxr-leadership" aria-labelledby="uxr-leadership-title">
              <p className="uxr-section-label">Research leadership in practice</p>
              <div className="uxr-section-heading">
                <h2 id="uxr-leadership-title">Depth means showing how evidence changed a decision.</h2>
                <p>The two principal cases expose the research question, study structure, synthesis, service decisions, collaboration boundaries, methodological limits, and next validation round—not just the final artifact.</p>
              </div>
              <div className="uxr-signal-grid">
                {leadershipSignals.map((signal) => (
                  <article key={signal.num}>
                    <span>{signal.num}</span>
                    <h3>{signal.title}</h3>
                    <p>{signal.body}</p>
                    <small>{signal.proof}</small>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>

          <section id="research-work" className="uxr-work" aria-labelledby="uxr-work-title">
            <p className="uxr-section-label">Selected research work</p>
            <div className="uxr-section-heading uxr-section-heading--work">
              <h2 id="uxr-work-title">Two complex systems. Two inspectable research stories.</h2>
              <p>NYU Langone traces a multilingual healthcare study through 20 interviews. Raahi shows how service research shaped decisions across digital and physical transit touchpoints.</p>
            </div>
            <Reveal><ResearchCaseCard study={researchCases[0]} featured /></Reveal>
            <div className="uxr-case-grid uxr-case-grid--depth">
              <Reveal><ResearchCaseCard study={researchCases[1]} /></Reveal>
            </div>
            <div className="uxr-section-heading uxr-section-heading--supporting">
              <h2>Supporting research work.</h2>
              <p>Additional cases show evaluative and product-research range without presenting thinner evidence as equivalent to the two studies above.</p>
            </div>
            <div className="uxr-case-grid">
              {researchCases.slice(2).map((study) => <Reveal key={study.slug}><ResearchCaseCard study={study} /></Reveal>)}
            </div>
          </section>

          <Reveal>
            <section className="uxr-lifecycle" aria-labelledby="uxr-lifecycle-title">
              <p className="uxr-section-label">End-to-end research lifecycle</p>
              <div className="uxr-section-heading">
                <h2 id="uxr-lifecycle-title">From an ambiguous request to a reusable learning loop.</h2>
                <p>The process flexes with the problem, but ownership remains continuous: align, plan, learn, synthesize, decide, and validate.</p>
              </div>
              <ol>
                {lifecycle.map(([num, title, body]) => <li key={num}><span>{num}</span><h3>{title}</h3><p>{body}</p></li>)}
              </ol>
            </section>
          </Reveal>

          <Reveal>
            <section className="uxr-ai" aria-labelledby="uxr-ai-title">
              <div>
                <p className="uxr-section-label">AI in the research loop</p>
                <h2 id="uxr-ai-title">Accelerate the mechanics. Keep judgment human.</h2>
              </div>
              <div className="uxr-ai__body">
                <p>I use AI to search existing evidence, prepare discussion-guide variants, structure notes, expose contradictory signals, and accelerate first-pass synthesis. Participant meaning, consent, sensitive interpretation, and final recommendations remain human decisions.</p>
                <ul>
                  <li><span>01</span><strong>Traceable</strong><p>Generated summaries must point back to source evidence.</p></li>
                  <li><span>02</span><strong>Critical</strong><p>Contradictions and minority signals stay visible instead of being averaged away.</p></li>
                  <li><span>03</span><strong>Useful</strong><p>Automation should increase learning velocity, not produce more research theater.</p></li>
                </ul>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section className="uxr-cta">
              <p className="uxr-section-label">Research collaboration</p>
              <h2>Bring the customer into the decision before the decision becomes expensive.</h2>
              <div>
                <a href={`mailto:${CONTACT_EMAIL}?subject=UX%20Research%20conversation`} className="uxr-button figma-hover">Start a conversation <span aria-hidden="true">↗</span></a>
                <Link to="/work" className="uxr-text-link figma-hover">View all work</Link>
              </div>
            </section>
          </Reveal>
        </div>
      </main>
      <Footer />
    </div>
  )
}
