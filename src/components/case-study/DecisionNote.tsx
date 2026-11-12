import './decision-note.css'
export type ScreenDecision = { question: string; choice: string; evidence: string; limit?: string }

/** Editorial annotation of a source artifact, not a new product or research result. */
export default function DecisionNote({ decision }: { decision: ScreenDecision }) {
  return <div className="screen-decision">
    <dl>
      <div><dt>Design question</dt><dd>{decision.question}</dd></div>
      <div><dt>Decision</dt><dd>{decision.choice}</dd></div>
      <div><dt>Read the screen</dt><dd>{decision.evidence}</dd></div>
    </dl>
    {decision.limit && <p className="screen-decision__limit">{decision.limit}</p>}
  </div>
}
