import '../styles/hero-artifacts.css'
import AsciiHeroImage from './AsciiHeroImage'
import { categoryModels } from './asciiCategoryModels'

export default function CategoryAsciiArtifact({ slug, motionEnabled = true }: { slug: string; motionEnabled?: boolean }) {
  return <div className="category-ascii-artifact">
    <AsciiHeroImage key={slug} className="category-ascii-artifact__object" motionEnabled={motionEnabled} model={categoryModels[slug] || 'knot'} />
  </div>
}
