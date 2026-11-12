interface CsInfoGridProps {
  items: { key: string; value: string }[];
}

export default function CsInfoGrid({ items }: CsInfoGridProps) {
  return (
    <div className="cs-info-grid">
      {items.map((item) => (
        <div key={item.key} className="cs-info-item">
          <span className="cs-info-key">{item.key}</span>
          <span className="cs-info-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
