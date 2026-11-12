import { sentenceCaseProjectLabel } from '../../utils/projectPresentation';

interface CsStatGridProps {
  stats: { label: string; value: string }[];
  className?: string;
  style?: React.CSSProperties;
}

export default function CsStatGrid({ stats, className, style }: CsStatGridProps) {
  return (
    <div className={`cs-stat-grid${className ? ` ${className}` : ''}`} style={style}>
      {stats.map((stat) => (
        <div key={stat.label} className="cs-stat-card">
          <span className="cs-stat-label">{sentenceCaseProjectLabel(stat.label)}</span>
          <span className="cs-stat-value">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
