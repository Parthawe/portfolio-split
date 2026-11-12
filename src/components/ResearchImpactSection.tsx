import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'

const evidenceStats = [
  { value: '20', label: 'Primary interviews', detail: 'Flagship healthcare study' },
  { value: '16', label: 'Multilingual participants', detail: 'People with limited English proficiency' },
  { value: '04', label: 'Healthcare professionals', detail: 'Clinical and care-system perspectives' },
  { value: '04', label: 'Research contexts', detail: 'Health, transit, housing, and wearables' },
] as const

const decisions = [
  {
    project: 'NYU Langone',
    href: '/medimorpho',
    finding: 'Translation alone did not resolve uncertainty across the care journey.',
    change: 'A shared encounter model for language identification, live understanding, and post-visit recap.',
  },
  {
    project: 'Raahi',
    href: '/raahi-project',
    finding: 'Riders experienced transit as one journey, not a collection of disconnected screens.',
    change: 'A connected service spanning app, kiosk, vehicle, route information, and wayfinding.',
  },
  {
    project: 'VJ Parivar',
    href: '/vj-software',
    finding: 'Parking was a spatial, high-consequence choice hidden inside an administrative flow.',
    change: 'A map-first booking experience that makes the physical decision visible before commitment.',
  },
  {
    project: 'Mentra',
    href: '/mentra',
    finding: 'Setup, daily use, apps, and buying were being designed as separate smart-glasses experiences.',
    change: 'One platform model connecting the OS, companion app, MiniApp Store, privacy cues, and launch story.',
  },
] as const

const methods = [
  { name: 'Contextual inquiry', x: 18, y: 20 },
  { name: 'User interviews', x: 31, y: 32 },
  { name: 'Affinity mapping', x: 43, y: 47 },
  { name: 'Journey mapping', x: 55, y: 38 },
  { name: 'Audience research', x: 29, y: 72 },
  { name: 'Task analysis', x: 66, y: 63 },
  { name: 'Prototype validation', x: 82, y: 74 },
] as const

export default function ResearchImpactSection() {
  return (
    <section className="research-impact" aria-labelledby="research-impact-title">
      <div className="research-impact__intro">
        <p className="research-impact__eyebrow"><i aria-hidden="true" /> Evidence → decision</p>
        <h2 id="research-impact-title">Research is useful when it changes what gets built.</h2>
        <p>
          I frame studies around the decision at risk, trace findings back to evidence,
          and translate synthesis into a product or service direction teams can act on.
        </p>
      </div>

      <dl className="research-impact__stats" aria-label="Verified research scale">
        {evidenceStats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.value}</dt>
            <dd>
              <strong>{stat.label}</strong>
              <span>{stat.detail}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="research-impact__map">
        <div className="research-impact__map-copy">
          <span>Method selection</span>
          <h3>Match the method to the question—not the trend.</h3>
          <p>
            The study moves from open-ended learning toward focused evaluation,
            combining behavioral depth with measurable evidence as confidence grows.
          </p>
        </div>

        <figure className="research-impact__matrix" aria-labelledby="research-methods-title">
          <figcaption id="research-methods-title">Research methods across a study</figcaption>
          <span className="research-impact__axis research-impact__axis--top">Qualitative</span>
          <span className="research-impact__axis research-impact__axis--bottom">Quantitative</span>
          <span className="research-impact__axis research-impact__axis--left">Generative</span>
          <span className="research-impact__axis research-impact__axis--right">Evaluative</span>
          <div className="research-impact__plot" aria-hidden="true">
            {methods.map((method, index) => (
              <span
                key={method.name}
                className="research-impact__method-point"
                style={{ '--method-x': `${method.x}%`, '--method-y': `${method.y}%` } as CSSProperties}
              >
                <i>{String(index + 1).padStart(2, '0')}</i>
                <b>{method.name}</b>
              </span>
            ))}
          </div>
        </figure>
      </div>

      <div className="research-impact__ledger">
        <div className="research-impact__ledger-head" aria-hidden="true">
          <span>Context</span>
          <span>Signal found</span>
          <span>Decision changed</span>
        </div>
        {decisions.map((decision, index) => (
          <Link key={decision.project} to={decision.href} className="research-impact__row figma-hover">
            <span className="research-impact__project"><i>{String(index + 1).padStart(2, '0')}</i>{decision.project}</span>
            <span>{decision.finding}</span>
            <strong>{decision.change}<b aria-hidden="true">↗</b></strong>
          </Link>
        ))}
      </div>

    </section>
  )
}
