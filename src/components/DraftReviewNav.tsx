import { useDraftReturn } from '../hooks/useDraftReturn'
import { experiencePreviewsEnabled } from '../utils/experiencePreview'
import './DraftReviewNav.css'
import {Link} from 'react-router-dom'
import {projects} from '../data/projects'
export const draftReviewOrder=['typeface','atps','enigma','jugalbandi','moniac-machine','the-omakase','revolving-stage','sea-of-salt','black-hole','mentra','mentra-miniapps','clawed-chat','executivelens','org-dashboard','healthapp','vj-software','code-for-build','ballah-code','raahi-project','transfi-project','zentipay','medimorpho']
export default function DraftReviewNav({project}:{project:string}){
 const directory=useDraftReturn()
 const index=draftReviewOrder.indexOf(project)
 if(!experiencePreviewsEnabled||index<0)return null
 const name=(slug:string)=>projects.find(item=>item.slug===slug)?.name??slug
 return <nav className="draft-review-nav" aria-label="More project experiences"><span>Continue exploring</span><div>{index>0&&<Link className="glass-action" state={directory.state} to={`/experience-preview/${draftReviewOrder[index-1]}`}>Previous · {name(draftReviewOrder[index-1])}</Link>}<Link className="glass-action" to={directory.href}>All experiences</Link>{index<draftReviewOrder.length-1&&<Link className="glass-action" state={directory.state} to={`/experience-preview/${draftReviewOrder[index+1]}`}>Next · {name(draftReviewOrder[index+1])}</Link>}</div></nav>
}
