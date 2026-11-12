import { useId, useState } from 'react'
import { studyComparisons } from '../../data/studyComparisons'

/** An editorial comparison, never presented as a recovered prototype or test result. */
export default function StudyExplorer({ project }: { project: string }) {
  const study = studyComparisons[project]
  const [selected, setSelected] = useState(0)
  const id = useId()
  if (!study) return null
  const item = study.items[selected]
  return <div className="study-explorer">
    <p className="study-explorer__intro">{study.intro}</p>
    <div className="study-explorer__choices" role="group" aria-label="Choose a study to compare">
      {study.items.map((option, index) => <button type="button" key={option.title}
        aria-pressed={selected === index} aria-controls={id} onClick={() => setSelected(index)}>{option.title}</button>)}
    </div>
    <div id={id} className="study-explorer__reading" aria-live="polite" aria-atomic="true">
      <h3>{item.title}</h3>
      <ol className="study-explorer__flow">
        {[['Input', item.input], ['Mapping', item.mapping], ['Response', item.response]].map(([label, text]) => <li key={label}><span>{label}</span><p>{text}</p></li>)}
      </ol>
      <div className="study-explorer__question"><strong>What needs testing</strong><p>{item.question}</p></div>
    </div>
    <p className="study-explorer__note">New reading aid based on the course notes. Original prototypes and test results are not reproduced here.</p>
  </div>
}
