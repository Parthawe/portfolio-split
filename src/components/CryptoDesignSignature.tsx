const RAIL_STEPS = [
  { num: '01', label: 'Intent', detail: 'Amount, destination, and purpose stay visible.' },
  { num: '02', label: 'Quote', detail: 'Fees, rate, network, and expiry arrive before commitment.' },
  { num: '03', label: 'Review', detail: 'Risk and irreversible actions get a calm second look.' },
  { num: '04', label: 'Receipt', detail: 'Status, proof, and recovery survive after money moves.' },
] as const

const PRINCIPLES = [
  ['No black boxes', 'Make the rail, fee, status, and next action inspectable.'],
  ['Design the anxious states', 'Pending, failed, reversed, and expired are core product states.'],
  ['Translate the protocol', 'Keep the power of crypto without making users speak crypto.'],
] as const

export default function CryptoDesignSignature() {
  return (
    <section className="crypto-signature" aria-labelledby="crypto-signature-title">
      <div className="crypto-signature-heading">
        <p className="crypto-kicker">My crypto product lens</p>
        <h2 id="crypto-signature-title">Money movement should read like a story, not a block explorer.</h2>
        <p>
          I design the full decision chain, from the first quote to the final receipt, so people know what is happening,
          what it costs, and what they can do next.
        </p>
      </div>

      <ol className="crypto-rail" aria-label="Crypto transaction experience">
        {RAIL_STEPS.map((step, index) => (
          <li key={step.label}>
            <div className="crypto-rail-node">
              <span>{step.num}</span>
              <i aria-hidden="true" />
            </div>
            <div>
              <h3>{step.label}</h3>
              <p>{step.detail}</p>
            </div>
            {index < RAIL_STEPS.length - 1 ? <span className="crypto-rail-connector" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>

      <div className="crypto-principles">
        {PRINCIPLES.map(([title, detail], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
