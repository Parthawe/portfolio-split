import { Link } from 'react-router-dom'
import { getProject } from '../../data/projects'
import { projectImageProps } from '../../utils/projectImage'

const links: Record<string, { slug: string; title: string; note: string }[]> = {
  'embodied-web': [{ slug: 'comp-media', title: 'Computational Media', note: 'Try the restored camera-and-particle sketch.' }, { slug: 'mentra', title: 'Mentra', note: 'Inspect feedback across wearable and phone interfaces.' }],
  'feeling-patterns': [{ slug: 'shuffle', title: 'Shuffle', note: 'See a documented physical feedback mechanism.' }],
  'performance-by-design': [{ slug: 'drowning', title: 'Drowning', note: 'Compare the documented scenic and lighting direction.' }, { slug: 'tedx', title: 'TEDx VIT Pune', note: 'Follow a stage design from concept to event.' }],
  'hypercinema': [{ slug: 'sea-of-salt', title: 'Why the Sea is Salt', note: 'Follow a story through a physical consequence.' }, { slug: 'uv-light', title: 'UV Light Experience', note: 'Inspect a staged reveal with available documentation.' }],
  'storytelling': [{ slug: 'enigma', title: 'Enigma', note: 'A drawn letter leads to a visible processing sequence.' }, { slug: 'sea-of-salt', title: 'Why the Sea is Salt', note: 'A narrative advances through a material interaction.' }],
  'arcade-lab': [{ slug: 'the-omakase', title: 'The Omakase', note: 'Watch the finished cabinet and inspect its controls.' }],
  'on-becoming': [{ slug: 'jugalbandi', title: 'Jugalbandi', note: 'The physical and acoustic constraints behind the musical interaction.' }, { slug: 'mentra', title: 'Mentra', note: 'The operating model behind first use and everyday control.' }],
}

export default function RelatedProjectEvidence({ slug }: { slug: string }) {
  const items = links[slug]
  if (!items) return null
  return <section className="project-evidence-links" aria-label="Related documented work">
    <h2>See the related work</h2>
    <div>{items.map(item => {
      const project = getProject(item.slug)
      const src = project?.cover16x9 || project?.image
      return <Link key={item.slug} to={`/${item.slug}`}>
        {src && <img {...projectImageProps(src)} src={src} alt="" loading="lazy" />}
        <span><strong>{item.title}</strong><span>{item.note}</span></span>
      </Link>
    })}</div>
  </section>
}
