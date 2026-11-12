import { sentenceCaseProjectLabel } from '../../utils/projectPresentation';

interface CsFeatureGridProps {
  features: { title: string; desc: string }[];
  className?: string;
}

/** Reading content stays visible without waiting for an intersection animation. */
export default function CsFeatureGrid({ features, className }: CsFeatureGridProps) {
  return (
    <div className={['cs-feature-grid', className].filter(Boolean).join(' ')}>
      {features.map((feature, index) => (
        <div key={`${feature.title || 'feature'}-${index}`} className="cs-feature-card">
          <h3 className="cs-feature-card-title">{sentenceCaseProjectLabel(feature.title)}</h3>
          <p className="cs-feature-card-desc">{feature.desc}</p>
        </div>
      ))}
    </div>
  );
}
