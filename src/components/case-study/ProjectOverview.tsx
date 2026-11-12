interface ProjectOverviewProps {
  id?: string;
  sections: { label: string; content: string }[];
}

export default function ProjectOverview({ id, sections }: ProjectOverviewProps) {
  return (
    <section className="wrap project-overview reveal" id={id}>
      <div className="proj-overview-grid">
        {sections.map((s, index) => (
          <article
            key={s.label}
            className={`proj-overview-card surface-glass surface-glass--subtle${index === 0 && sections.length > 2 ? ' proj-overview-card--wide' : ''}`}
          >
            <span className="proj-overview-index">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="proj-overview-label">{s.label}</h2>
            <p className="proj-desc">{s.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
