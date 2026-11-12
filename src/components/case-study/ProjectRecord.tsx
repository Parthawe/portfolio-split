import { projectRecords } from '../../data/projectRecords'

export default function ProjectRecord({ slug }: { slug: string }) {
  const record = projectRecords[slug]
  if (!record) return null
  if (slug === 'jugalbandi') return <div className="project-record"><span>Physical installation</span><p>See the actual build in the <a className="cs-text-link" href="#cs-film">performance film</a> and <a className="cs-text-link" href="#cs-instrument">instrument photographs</a>. The mechanism studies below explain the construction.</p></div>
  return <div className="project-record">
    <span>{record.kind}</span>
    <details>
      <summary>About the material</summary>
      <p>{record.evidence}</p>
      {record.boundary && <p>{record.boundary}</p>}
    </details>
  </div>
}
