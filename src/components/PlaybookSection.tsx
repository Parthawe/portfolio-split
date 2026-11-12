import { Link } from 'react-router-dom'
import { PLAYBOOK_VALUES } from '../data/playbook'

/* Slim teaser for category pages: the playbook point names roll by in an
   infinite strip (like the "Playbook Points" row on designwhich.works/ux)
   and the whole thing links to the full /playbook page. */
export default function PlaybookSection() {
  return (
    <section className="lp-playbook-strip" aria-labelledby="lp-playbook-title">
      <div className="lp-playbook-strip-head">
        <p className="lp-section-label" id="lp-playbook-title">Playbook points</p>
        <Link to="/playbook" className="lp-playbook-link figma-hover">
          Read the playbook ↗
        </Link>
      </div>
      <Link to="/playbook" className="pb-strip pb-strip--linked" aria-label="Read the full playbook">
        <div className="pb-strip-track">
          {[0, 1].map((copy) =>
            PLAYBOOK_VALUES.map((value) => (
              <span key={`${copy}-${value.slug}`} className="pb-strip-item" aria-hidden={copy === 1 || undefined}>
                <i aria-hidden="true">✦</i> {value.title}
              </span>
            )),
          )}
        </div>
      </Link>
    </section>
  )
}
