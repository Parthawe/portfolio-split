import type { ReactNode } from "react";

interface CsSectionProps {
  id?: string;
  label?: string;
  title: string;
  children: ReactNode;
}

export default function CsSection({ id, title, children }: CsSectionProps) {
  return (
    <section
      className="cs-section"
      id={id}
    >
      <div className="wrap cs-section-grid">
        <div className="cs-section-head">
          <h2
            className="cs-section-title"
          >
            {title}
          </h2>
        </div>
        <div className="cs-section-content">
          {children}
        </div>
      </div>
    </section>
  );
}
