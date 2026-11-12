interface CsStepsProps {
  steps: { num: number | string; title: string; desc: string }[];
}

export default function CsSteps({ steps }: CsStepsProps) {
  return (
    <div className="cs-steps">
      {steps.map((step) => (
        <div key={step.num} className="cs-step">
          <div className="cs-step-num">{step.num}</div>
          <h3 className="cs-step-title">{step.title}</h3>
          <p className="cs-step-desc">{step.desc}</p>
        </div>
      ))}
    </div>
  );
}
