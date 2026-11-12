interface CsThanksProps {
  className?: string;
  style?: React.CSSProperties;
  contactCta?: boolean;
}

export default function CsThanks({ className, style }: CsThanksProps) {
  return (
    <section className={`cs-section cs-thanks reveal${className ? ` ${className}` : ''}`} style={style}>
      <div className="wrap">
        <h2 className="cs-thanks-title">Thank You</h2>
      </div>
    </section>
  );
}
