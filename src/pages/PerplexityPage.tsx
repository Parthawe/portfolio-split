import { useEffect, useState, type CSSProperties } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Reveal } from '../components/Reveal'
import '../styles/perplexity.css'

const roleNeeds = [
  {
    number: '01',
    title: 'Ship the channel',
    body: 'This is a video-production role first: concept, storyboard, animate, finish, and keep a high-volume social pipeline moving without lowering the craft bar.',
  },
  {
    number: '02',
    title: 'Make AI observable',
    body: 'The product story is strongest when viewers can see the request, orchestration, evidence, artifact, and moment of control—not only an abstract promise about intelligence.',
  },
  {
    number: '03',
    title: 'Build the repeatable layer',
    body: 'Motion principles, modular After Effects builds, and planned delivery formats let every launch move faster than the last while remaining distinctly Perplexity.',
  },
]

const productSignals = [
  {
    product: 'Computer',
    truth: 'A general-purpose digital worker that can run complete workflows in the background, from a single task through research, tools, and a finished artifact.',
    motion: 'Reveal the orchestration without turning long-running work into a decorative loading loop.',
    href: 'https://www.perplexity.ai/products/computer',
  },
  {
    product: 'Deep Research',
    truth: 'Builds a research plan, searches primary sources in parallel, cites every claim, and turns the result into reports, decks, spreadsheets, or dashboards.',
    motion: 'Keep the source attached as evidence moves from research into an editable deliverable.',
    href: 'https://www.perplexity.ai/hub/products/deep-research',
  },
  {
    product: 'Comet',
    truth: 'A browser assistant with page and cross-tab context that can summarize, navigate, fill forms, and complete tasks inside the browsing flow.',
    motion: 'Show scope, action, and permission as one sequence so autonomy never hides control.',
    href: 'https://www.perplexity.ai/comet/resources/articles/comet-quick-start-guide',
  },
]

const productInterventions = [
  {
    number: '01',
    product: 'Computer',
    moment: 'Returning to long-running work',
    observed: 'Computer can work in the background for hours or months, run recurring tasks, and accept guidance while it works.',
    change: 'Use a resumable progress narrative: completed, active, waiting, review. On return, reveal only what changed since the last visit.',
    restraint: 'No perpetual “AI is working” loop.',
    sequence: ['Ask', 'Work', 'Wait', 'Review'],
    href: 'https://www.perplexity.ai/products/computer',
  },
  {
    number: '02',
    product: 'Deep Research',
    moment: 'Evidence becoming a deliverable',
    observed: 'A question becomes a plan, many retrieval steps, cited claims, and a report, deck, spreadsheet, or dashboard.',
    change: 'Let citations keep their identity as a claim moves into the artifact; use a deliberate hold when the recommendation appears.',
    restraint: 'No unreadable source ticker.',
    sequence: ['Plan', 'Search', 'Cite', 'Build'],
    href: 'https://www.perplexity.ai/hub/products/deep-research',
  },
  {
    number: '03',
    product: 'Comet',
    moment: 'Moving from reading to action',
    observed: 'Comet can use page and cross-tab context and automate browser tasks; Enterprise permissions can require case-by-case consent before browser control.',
    change: 'Keep the scope visible, preview the action, pause for consent, then show completion with a clear route to recover or revise.',
    restraint: 'Never animate past consent.',
    sequence: ['Scope', 'Preview', 'Confirm', 'Done'],
    href: 'https://www.perplexity.ai/help-center/en/articles/13531023-managing-comet-assistant-permissions',
  },
  {
    number: '04',
    product: 'Create files & apps',
    moment: 'Revising generated work',
    observed: 'Perplexity can preview and edit documents, presentations, spreadsheets, and apps, with follow-up prompts and version history.',
    change: 'Preserve shared content anchors between formats, then highlight the exact edit so a revision reads as a change—not a replacement.',
    restraint: 'Do not wipe the whole canvas.',
    sequence: ['Draft', 'Preview', 'Revise', 'Export'],
    href: 'https://www.perplexity.ai/help-center/en/articles/12528830-creating-assets-with-perplexity-overview',
  },
]

const conceptRoutes = [
  {
    number: 'A',
    title: 'Model constellation',
    thought: 'Specialist models assemble around one request.',
    verdict: 'Visually expressive, but too close to generic AI spectacle. The product and user outcome disappear.',
    status: 'Set aside',
    visual: 'constellation',
  },
  {
    number: 'B',
    title: 'Interface chase',
    thought: 'A cursor races through a sequence of product states.',
    verdict: 'Proves speed, but turns the story into a feature tour and gives evidence no time to land.',
    status: 'Set aside',
    visual: 'cursor',
  },
  {
    number: 'C',
    title: 'Evidence becomes work',
    thought: 'A real request branches into research, then resolves as a useful artifact.',
    verdict: 'Chosen because it connects Computer, Deep Research, citations, and a human outcome in one repeatable story.',
    status: 'Selected',
    visual: 'evidence',
  },
]

const sketchFrames = [
  ['01', 'Outcome first', 'Open on the finished brief.'],
  ['02', 'Decompose', 'One request becomes a plan.'],
  ['03', 'Work in parallel', 'Research and tools split.'],
  ['04', 'Keep the trail', 'Sources stay with claims.'],
  ['05', 'Build the artifact', 'Evidence becomes usable work.'],
  ['06', 'Hold for review', 'Trust, then the next action.'],
]

const storyBeats = [
  ['00–02', 'Outcome', 'Open on the finished artifact so the value lands before the explanation.'],
  ['02–04', 'Ask', 'Reveal the useful human request that started the work.'],
  ['04–08', 'Orchestrate', 'Show parallel research and tool use as one readable plan.'],
  ['08–12', 'Prove', 'Attach sources to the finding and hold long enough to verify it.'],
  ['12–15', 'Deliver', 'Return to the artifact, the Perplexity mark, and one next action.'],
]

const territories = [
  {
    number: '01',
    label: 'Perplexity Computer',
    title: 'One prompt. A whole workflow.',
    body: 'Make delegation understandable without diagram overload: request, task plan, parallel specialists, live progress, finished deliverable.',
    deliverables: '30s launch · 15s use case · 6s outcome',
    visual: 'computer',
  },
  {
    number: '02',
    label: 'Deep Research in Computer',
    title: 'Evidence becomes finished work.',
    body: 'Turn iterative research into a visible narrative: plan, search, compare, cite, then build a report, deck, dashboard, or site.',
    deliverables: '15s launch · 9:16 proof · 6s citation hold',
    visual: 'research',
  },
  {
    number: '03',
    label: 'Comet',
    title: 'The browser moves work forward.',
    body: 'Show understanding, action, and confirmation in one spatial model so the assistant feels capable without making the user feel absent.',
    deliverables: '15s use case · feature cutdowns · 9:16 story',
    visual: 'comet',
  },
]

const motionPrinciples = [
  ['Clarity before flourish', 'Movement explains a state, relationship, or result before it adds personality.'],
  ['The answer earns a hold', 'Fast research can feel capable; the final evidence needs enough stillness to be read and trusted.'],
  ['Sources stay attached', 'Citations travel with the claim through transitions, crops, and cutdowns.'],
  ['One spatial model', 'Ask, plan, work, and answer occupy consistent regions so speed never destroys orientation.'],
  ['Sound has an information job', 'Rhythm marks phase changes; quieter moments create space for proof and comprehension.'],
  ['Stillness is part of the system', 'A still is the right output when motion would only repeat information or reduce legibility.'],
]

const productionRows = [
  ['00_MASTER_STORY', 'Narrative markers · music edit · protected ending', 'Master'],
  ['01_CTRL_SYSTEM', 'Tempo · accent · type scale · source count', 'Controls'],
  ['02_PRODUCT_STATES', 'Prompt · plan · research · answer · action', 'Protected'],
  ['03_GTM_MODULES', 'Hook · proof · quote · CTA · end card', 'Swappable'],
  ['04_CAPTIONS_AUDIO', 'Sound-off copy · VO · mix · accessibility', 'Editable'],
  ['90_DELIVERY_FAMILY', '16:9 · 4:5 · 1:1 · 9:16 · still', 'Inherited'],
]

const proof = [
  {
    number: '01',
    title: 'VishwaConclave',
    label: 'Shipped campaign direction',
    body: 'An official event-campaign archive moving from intrigue to reveal, proof, and registration across film and social.',
    image: '/Assets/mockups/projects/vishwaconclave_16x9.webp',
    href: '/motion/vishwa-conclave-motion',
  },
  {
    number: '02',
    title: 'Mentra',
    label: 'Hardware GTM proposal',
    body: 'A proposed 15-second advertising hierarchy built from original Mentra brand work and clearly attributed product footage.',
    image: '/Assets/Projects/mentra-brand/photos/render-both-frames.webp',
    href: '/motion/mentra-motion-language',
  },
  {
    number: '03',
    title: 'TransFi',
    label: 'Product-state motion proposal',
    body: 'A proposed transaction story built from original product states, using timing and continuity to make each step observable.',
    image: '/Assets/Projects/Transfi/public/Frame 427318646.png',
    href: '/motion/transfi-identity-motion',
  },
  {
    number: '04',
    title: 'Editing motion stories',
    label: 'Completed editorial work',
    body: 'Four finished project films examined through structure, pacing, motion graphics, and final delivery.',
    image: '/Assets/images/enigma.jpg',
    href: '/motion/editing-motion-stories',
  },
]

const firstNinety = [
  {
    range: '00–30',
    title: 'Learn by shipping',
    body: 'Audit recent launch output, shadow Brand and Growth, map the production pipeline, and ship initial social work inside the existing visual language.',
  },
  {
    range: '31–60',
    title: 'Name the repeatable parts',
    body: 'Codify timing, product-state behavior, source treatment, end cards, caption rules, file architecture, and versioning patterns from real work.',
  },
  {
    range: '61–90',
    title: 'Make the system useful',
    body: 'Turn proven patterns into templates, expressions, review checkpoints, and AI-assisted utilities that remove repetitive work without automating taste.',
  },
]

function useMotionControl() {
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPlaying(!media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return { playing, setPlaying }
}

function PerplexityPrototype({ playing }: { playing: boolean }) {
  return (
    <div className={`perp-prototype${playing ? '' : ' is-paused'}`} role="img" aria-label="Speculative Perplexity Computer launch-film prototype moving from a request through parallel research and cited evidence to a finished campaign brief">
      <div className="perp-prototype__top" aria-hidden="true">
        <span><img src="/Assets/brands/perplexity-mark.svg" alt="" /> PERPLEXITY / COMPUTER STUDY</span>
        <span>15 SEC MASTER · 01</span>
      </div>

      <div className="perp-prototype__scene perp-prototype__scene--ask" aria-hidden="true">
        <p>Research the AI browser category<br />and turn it into a launch brief.</p>
        <span><i /> Start a task</span>
      </div>

      <div className="perp-prototype__scene perp-prototype__scene--research" aria-hidden="true">
        <div className="perp-research-map">
          <span>Plan</span><i /><span>Search</span><i /><span>Compare</span><i /><span>Build</span>
        </div>
        <div className="perp-source-stack">
          <span><b>01</b> Product pages</span>
          <span><b>02</b> Market reporting</span>
          <span><b>03</b> Audience signals</span>
        </div>
        <strong>Computer works<br />across the whole brief.</strong>
      </div>

      <div className="perp-prototype__scene perp-prototype__scene--answer" aria-hidden="true">
        <small>CAMPAIGN BRIEF / 18 SOURCES</small>
        <h2>A cited brief, ready to review.</h2>
        <p>Audience, positioning, proof points, channels, and open questions—built from live evidence.</p>
        <div><span>1</span><span>2</span><span>3</span><span>+15</span></div>
      </div>

      <div className="perp-prototype__scene perp-prototype__scene--land" aria-hidden="true">
        <div className="perp-prototype__brand"><img src="/Assets/brands/perplexity-mark.svg" alt="" /><p>Perplexity</p></div>
        <strong>Chat answers.<br />Computer works.</strong>
        <span>Independent motion study</span>
      </div>

      <div className="perp-prototype__timeline" aria-hidden="true">
        <i /><span>ASK</span><span>RESEARCH</span><span>VERIFY</span><span>LAND</span>
      </div>
    </div>
  )
}

function PerplexitySystemMap() {
  const stages = [
    ['01', 'Request', 'Keep the human intent visible.'],
    ['02', 'Plan', 'Show how the work decomposes.'],
    ['03', 'Evidence', 'Attach sources to the claim.'],
    ['04', 'Artifact', 'Turn research into useful work.'],
    ['05', 'Review', 'Return control before action.'],
  ]

  return (
    <div className="perp-system-map" role="img" aria-label="Perplexity motion model showing a request becoming a plan, evidence, a finished artifact, and a review moment">
      <header>
        <span><img src="/Assets/brands/perplexity-mark.svg" alt="" /> Perplexity product motion model</span>
        <small>Intent stays visible from request to result</small>
      </header>
      <div className="perp-system-map__flow" aria-hidden="true">
        {stages.map(([number, title, note], index) => (
          <div className="perp-system-map__stage" style={{ '--stage': index } as CSSProperties} key={number}>
            <span>{number}</span><strong>{title}</strong><small>{note}</small>
          </div>
        ))}
        <i className="perp-system-map__route" />
        <b className="perp-system-map__signal"><img src="/Assets/brands/perplexity-mark.svg" alt="" /></b>
      </div>
      <footer><span>Computer orchestrates</span><span>Deep Research proves</span><span>Comet acts with confirmation</span></footer>
    </div>
  )
}

function TerritoryVisual({ type }: { type: string }) {
  if (type === 'computer') {
    return (
      <div className="perp-territory-visual perp-territory-visual--computer" aria-hidden="true">
        <div className="perp-territory-brand"><img src="/Assets/brands/perplexity-mark.svg" alt="" /><span>Computer · orchestration</span></div>
        <div className="perp-computer-task"><span>Task</span><strong>Launch brief</strong></div>
        <div className="perp-computer-agents"><span>Research</span><span>Analysis</span><span>Writing</span><span>Design</span></div>
        <div className="perp-computer-output"><span>Output</span><strong>Brief.pdf</strong></div>
      </div>
    )
  }

  if (type === 'research') {
    return (
      <div className="perp-territory-visual perp-territory-visual--research" aria-hidden="true">
        <div className="perp-territory-brand"><img src="/Assets/brands/perplexity-mark.svg" alt="" /><span>Deep Research · evidence</span></div>
        <div><span>Question</span><strong>Why now?</strong></div>
        <i />
        <div><span>Sources</span><b>01</b><b>02</b><b>03</b></div>
        <i />
        <div><span>Answer</span><strong>Because...</strong></div>
      </div>
    )
  }

  if (type === 'comet') {
    return (
      <div className="perp-territory-visual perp-territory-visual--comet" aria-hidden="true">
        <div className="perp-territory-brand"><img src="/Assets/brands/perplexity-mark.svg" alt="" /><span>Comet · action with control</span></div>
        <p><span>01</span> Understand</p><p><span>02</span> Plan</p><p><span>03</span> Act</p><p><span>04</span> Confirm</p>
        <i />
      </div>
    )
  }

  return null
}

function ConceptVisual({ type }: { type: string }) {
  return (
    <div className={`perp-concept-visual perp-concept-visual--${type}`} aria-hidden="true">
      {type === 'constellation' ? <><i /><i /><i /><i /><span /></> : null}
      {type === 'cursor' ? <><span>Ask</span><i /><span>Work</span><i /><span>Done</span><b>↗</b></> : null}
      {type === 'evidence' ? <><span>Request</span><i /><span>Sources</span><i /><span>Brief</span><b>✓</b></> : null}
    </div>
  )
}

export default function PerplexityPage() {
  const { playing, setPlaying } = useMotionControl()
  const style = { '--project-color': 'var(--ink)' } as CSSProperties

  useEffect(() => {
    document.body.classList.add('page-perplexity-monochrome')
    return () => document.body.classList.remove('page-perplexity-monochrome')
  }, [])

  return (
    <>
      <Helmet>
        <title>Perplexity Creative Studio Motion Study · Parth Pawar</title>
        <meta name="description" content="An independent Creative Studio motion proposal for Perplexity Computer, Deep Research, and Comet—from ideation and storyboard to a reusable After Effects production system." />
        <meta property="og:title" content="Perplexity Creative Studio Motion Study · Parth Pawar" />
        <meta property="og:description" content="A product-grounded Perplexity motion study: concept routes, a working launch prototype, GTM cut families, and a scalable production system." />
        <link rel="canonical" href="https://designwhich.works/perplexity" />
      </Helmet>

      <Nav />
      <main id="main-content" className={`perplexity-page${playing ? '' : ' is-motion-paused'}`} style={style}>
        <div className="wrap">
          <section className="perp-hero" aria-labelledby="perp-title">
            <div className="perp-hero__eyebrow">
              <span><i /> Independent Creative Studio proposal</span>
              <span>Not commissioned · July 2026</span>
            </div>

            <div className="perp-hero__title">
              <div className="perp-hero__brand-lockup">
                <div className="perp-hero__mark-stage" aria-hidden="true">
                  <img src="/Assets/brands/perplexity-mark.svg" alt="" />
                  <i />
                </div>
                <div className="perp-hero__brand-caption"><span>Perplexity</span><small>Creative Studio study</small></div>
              </div>
              <h1 id="perp-title">Motion for AI that does the work—and shows enough to trust it.</h1>
            </div>

            <div className="perp-hero__intro">
              <p>A job-specific study for Perplexity Computer, Deep Research, and Comet: one launch prototype, a deliberate concept choice, and the production system behind a high-volume social family.</p>
              <div>
                <a className="perp-button perp-button--solid figma-hover" href="#prototype">View the concept <span>↓</span></a>
                <Link className="perp-button figma-hover" to="/motion">Motion portfolio <span>↗</span></Link>
              </div>
            </div>
          </section>

          <section id="prototype" className="perp-prototype-section" aria-labelledby="prototype-title">
            <div className="perp-section-head">
              <p><span>00</span> Working prototype</p>
              <div>
                <h2 id="prototype-title">One request becomes visible work.</h2>
                <button type="button" onClick={() => setPlaying((current) => !current)} aria-pressed={!playing}>
                  <i aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</i>{playing ? 'Pause motion' : 'Play motion'}
                </button>
              </div>
            </div>
            <PerplexityPrototype playing={playing} />
            <div className="perp-prototype-caption">
              <span>Speculative Computer launch story · grounded in public product language, not Perplexity product UI</span>
              <span>CSS motion · reduced-motion safe</span>
            </div>
          </section>

          <Reveal>
            <section className="perp-role" aria-labelledby="role-title">
              <div className="perp-section-head">
                <p><span>01</span> Reading the role</p>
                <div><h2 id="role-title">The brief asks for output, product judgment, and infrastructure.</h2></div>
              </div>
              <div className="perp-role__grid">
                {roleNeeds.map((item) => (
                  <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.body}</p></article>
                ))}
              </div>
              <a className="perp-source-link" href="https://jobs.ashbyhq.com/Perplexity/39d520eb-6b81-4b61-8b23-5efcdac4cad9" target="_blank" rel="noreferrer">
                <span>Source</span><strong>Member of Creative Studio (Motion Designer) · official role</strong><i>↗</i>
              </a>

              <div className="perp-product-truth">
                <div className="perp-product-truth__head">
                  <span>Product reading</span>
                  <h3>What is true now—and what motion needs to reveal.</h3>
                </div>
                <PerplexitySystemMap />
                <div className="perp-product-truth__rows">
                  {productSignals.map((item, index) => (
                    <a href={item.href} target="_blank" rel="noreferrer" key={item.product}>
                      <span>0{index + 1}</span>
                      <h4>{item.product}</h4>
                      <p>{item.truth}</p>
                      <strong>{item.motion}</strong>
                      <i aria-hidden="true">↗</i>
                    </a>
                  ))}
                </div>

                <div className="perp-intervention-audit">
                  <header className="perp-intervention-audit__head">
                    <div>
                      <span>Current-product intervention audit</span>
                      <h3>Four moments where motion can improve comprehension now.</h3>
                    </div>
                    <p>These are proposals, not claims about Perplexity’s current interface. Each starts from documented product behavior and names the point where motion should help—or deliberately stop.</p>
                  </header>
                  <div className="perp-intervention-audit__grid">
                    {productInterventions.map((item) => (
                      <article key={item.product}>
                        <div className="perp-intervention-audit__meta"><span>{item.number}</span><small>{item.moment}</small></div>
                        <h4>{item.product}</h4>
                        <p>{item.observed}</p>
                        <div className="perp-intervention-sequence" aria-label={`${item.product} motion sequence`}>
                          {item.sequence.map((phase, index) => <span style={{ '--phase': index } as CSSProperties} key={phase}>{phase}</span>)}
                        </div>
                        <dl>
                          <div><dt>Motion change</dt><dd>{item.change}</dd></div>
                          <div><dt>Restraint</dt><dd>{item.restraint}</dd></div>
                        </dl>
                        <a href={item.href} target="_blank" rel="noreferrer">Official product source <span>↗</span></a>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          <section className="perp-ideation" aria-labelledby="ideation-title">
            <div className="perp-section-head">
              <p><span>02</span> Concept development</p>
              <div><h2 id="ideation-title">Three ideas entered. One survived the product test.</h2><p>The chosen route had to communicate a real capability, preserve evidence, create an emotional payoff, and scale into a repeatable social family.</p></div>
            </div>
            <div className="perp-concept-grid">
              {conceptRoutes.map((concept) => (
                <Reveal key={concept.number}>
                  <article className={concept.status === 'Selected' ? 'is-selected' : ''}>
                    <ConceptVisual type={concept.visual} />
                    <div className="perp-concept-card__meta"><span>{concept.number}</span><small>{concept.status}</small></div>
                    <h3>{concept.title}</h3>
                    <p>{concept.thought}</p>
                    <strong>{concept.verdict}</strong>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="perp-sketchbook">
              <div className="perp-sketchbook__head"><span><img src="/Assets/brands/perplexity-mark.svg" alt="" /> Selected route / paper edit</span><p>Outcome first. Then reveal the orchestration and evidence that made it possible.</p></div>
              <div className="perp-sketchbook__frames">
                {sketchFrames.map(([number, title, note]) => (
                  <article className={`perp-sketch--${number}`} key={number}><span>{number}</span><div><i /><i /><i /></div><h3>{title}</h3><p>{note}</p></article>
                ))}
              </div>
            </div>
          </section>

          <section className="perp-territories" aria-labelledby="territories-title">
            <div className="perp-section-head">
              <p><span>03</span> Launch territories</p>
              <div><h2 id="territories-title">A pipeline, not a one-off reel.</h2><p>Three repeatable stories tied to current products and designed with their social cut families from the start.</p></div>
            </div>
            <div className="perp-territories__grid">
              {territories.map((territory) => (
                <Reveal key={territory.number}>
                  <article className="perp-territory-card">
                    <TerritoryVisual type={territory.visual} />
                    <div className="perp-territory-card__copy">
                      <p><span>{territory.number}</span>{territory.label}</p>
                      <h3>{territory.title}</h3>
                      <div><p>{territory.body}</p><small>{territory.deliverables}</small></div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <Reveal>
            <section className="perp-story" aria-labelledby="story-title">
              <div className="perp-section-head perp-section-head--light">
                <p><span>04</span> Fifteen-second story</p>
                <div><h2 id="story-title">Lead with value. Earn belief in the middle.</h2></div>
              </div>
              <div className="perp-story__track">
                {storyBeats.map(([time, title, body]) => (
                  <article key={time}><span>{time}</span><h3>{title}</h3><p>{body}</p></article>
                ))}
              </div>
              <div className="perp-story__note"><span>Editorial rule</span><p>The film can accelerate through parallel work, but the answer, citation, confirmation, and CTA cannot all arrive on the same frame.</p></div>
            </section>
          </Reveal>

          <section className="perp-principles" aria-labelledby="principles-title">
            <div className="perp-section-head">
              <p><span>05</span> Motion grammar</p>
              <div><h2 id="principles-title">Tighter, not busier.</h2><p>The reference point is the restraint and system thinking visible in Rob Diaz’s Perplexity work—not an imitation of his frames.</p></div>
            </div>
            <div className="perp-principles__grid">
              {motionPrinciples.map(([title, body], index) => (
                <Reveal key={title}><article><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></article></Reveal>
              ))}
            </div>
            <div className="perp-reference-links">
              <a href="https://robdiaz.com/work/perplexity-deep-research" target="_blank" rel="noreferrer"><span>Reference</span><strong>Rob Diaz · Deep Research in Perplexity Computer</strong><i>↗</i></a>
              <a href="https://robdiaz.com/articles/motion-design-workflow-2026" target="_blank" rel="noreferrer"><span>Process reference</span><strong>Clarity, timing, craft, and scalable production</strong><i>↗</i></a>
              <a href="https://www.perplexity.ai/products/computer" target="_blank" rel="noreferrer"><span>Product source</span><strong>Computer · a general-purpose digital worker</strong><i>↗</i></a>
            </div>
          </section>

          <Reveal>
            <section className="perp-production" aria-labelledby="production-title">
              <div className="perp-section-head">
                <p><span>06</span> After Effects system</p>
                <div><h2 id="production-title">One editable master. A complete delivery family.</h2><p>Figma preserves product truth; After Effects owns timing, compositing, and reusable modules; Premiere owns editorial and sound; Media Encoder creates controlled outputs.</p></div>
              </div>
              <div className="perp-production__body">
                <div className="perp-ae-map" aria-label="Proposed After Effects project structure">
                  <div className="perp-ae-map__head"><span>After Effects project map</span><span>Speculative production architecture</span></div>
                  {productionRows.map(([name, contents, type], index) => (
                    <div className="perp-ae-map__row" key={name}>
                      <i style={{ '--row': index === 0 ? 'var(--ink)' : index === productionRows.length - 1 ? 'color-mix(in srgb, var(--ink) 38%, transparent)' : 'color-mix(in srgb, var(--ink) 68%, transparent)' } as CSSProperties} />
                      <code>{name}</code><span>{contents}</span><small>{type}</small>
                    </div>
                  ))}
                </div>
                <div className="perp-delivery-map">
                  <article className="is-wide"><span>16:9</span><strong>Launch master</strong><i /></article>
                  <article className="is-square"><span>1:1</span><strong>Feed proof</strong><i /></article>
                  <article className="is-vertical"><span>9:16</span><strong>Social story</strong><i /></article>
                  <p>Protected type zones, inherited timing markers, swappable product states, sound-off captions, and one source of truth for every cut.</p>
                </div>
              </div>
            </section>
          </Reveal>

          <section className="perp-proof" aria-labelledby="proof-title">
            <div className="perp-section-head">
              <p><span>07</span> Evidence from current work</p>
              <div><h2 id="proof-title">The proposal is connected to work already done.</h2><p>Each study demonstrates a different part of the role: campaign cadence, GTM storytelling, product-state clarity, or editorial construction.</p></div>
            </div>
            <div className="perp-proof__grid">
              {proof.map((item) => (
                <Reveal key={item.number}>
                  <Link className="perp-proof-card figma-hover" to={item.href}>
                    <div><img src={item.image} alt="" loading="lazy" /></div>
                    <p><span>{item.number} · {item.label}</span><i>↗</i></p>
                    <h3>{item.title}</h3><small>{item.body}</small>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          <Reveal>
            <section className="perp-ninety" aria-labelledby="ninety-title">
              <div className="perp-section-head">
                <p><span>08</span> First ninety days</p>
                <div><h2 id="ninety-title">Ship first. Systematize what proves useful.</h2></div>
              </div>
              <div className="perp-ninety__grid">
                {firstNinety.map((phase) => (
                  <article key={phase.range}><span>{phase.range}</span><small>Days</small><h3>{phase.title}</h3><p>{phase.body}</p></article>
                ))}
              </div>
            </section>
          </Reveal>

          <section className="perp-close" aria-labelledby="close-title">
            <p>Independent study · Parth Pawar</p>
            <h2 id="close-title">Make the intelligence visible.<br />Keep the product believable.</h2>
            <div>
              <Link className="perp-button perp-button--light figma-hover" to="/motion">View motion work <span>↗</span></Link>
              <a className="perp-button perp-button--outline-light figma-hover" href="mailto:parthpawar@nyu.edu">Start a conversation <span>↗</span></a>
            </div>
            <small>This page is an independent portfolio response to a public role. It was not commissioned by, produced for, or approved by Perplexity. Product and role references are linked to their original sources; all proposed campaign concepts and the motion prototype are presented as speculative work.</small>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
