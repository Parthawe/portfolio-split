import CsScreenExplorer from '../../components/case-study/CsScreenExplorer'
import '../../components/case-study/service-decisions.css'
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import ProjectQuickSummary from '../../components/case-study/ProjectQuickSummary'
import CsExpandPreview from '../../components/case-study/CsExpandPreview'
import CsImage from '../../components/case-study/CsImage'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import GlasslyDemo from '../../components/GlasslyDemo'
import '../../styles/glassly-case-study.css'

const base = '/Assets/Projects/Glassly'
const sections = [
  { id: 'cs-summary', label: 'Overview' },
  { id: 'glassly-product', label: 'Product story' },
  { id: 'glassly-demo', label: 'Try the demo' },
  { id: 'glassly-hardware', label: 'Hardware & miniapps' },
  { id: 'glassly-brand', label: 'Brand system' },
  { id: 'glassly-interaction', label: 'Interaction rules' },
  { id: 'glassly-delivery', label: 'Delivery' },
]

export default function GlasslyPage() {
  const [viewMode, setViewMode] = useState<'summary' | 'full'>('summary')
  return <>
    <Helmet>
      <title>Glassly · Parth Pawar</title>
      <meta name="description" content="Glassly: product storytelling, brand guidelines and a working website demo for a wearable miniapp platform. Original interfaces and design evidence." />
      <meta property="og:title" content="Glassly · Parth Pawar" />
      <meta property="og:type" content="article" />
      <meta property="og:image" content="https://designwhich.works/Assets/Projects/Glassly/cover.webp" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="900" />
    </Helmet>
    <Nav />
    <main id="main-content" className="project-main project-main--glassly" style={{'--project-color':'#004DFC'} as React.CSSProperties}>
      <ProjectHeader backLink="/work" backLabel="Back to work" categorySlug="ai-wearables"
        tags={['Wearables','Product website','Brand system','Design engineering']}
        title="Glassly" subtitle="Making a wearable miniapp platform understandable before someone puts on the glasses."
        info={[{label:'Scope',value:'Product story, brand system and website'},{label:'Period',value:'2026'},{label:'Surfaces',value:'Web, phone and glasses demonstration'}]}
        heroExperience="visual" visualHeroImage={`${base}/cover.webp`} visualHeroAlt="Glassly identity with Even Realities G2 partner hardware"
        visualSummary="Miniapps on your phone. Useful information in view on your glasses."
        liveUrl="https://glassly.ai" liveLabel="Glassly website" showHeaderSummary={false} />
      <ProjectQuickSummary slug="glassly" title="Project overview" viewMode={viewMode} onViewModeChange={setViewMode} variant="open" proofLimit={0} />
      <CsExpandPreview expanded={viewMode==='full'} onExpand={()=>setViewMode('full')} cta="Read the full case study" previewImage={`${base}/website-hero.webp`} sectionIds={sections.map(section=>section.id)}>
        <section id="glassly-product" className="glassly-case-section"><div className="wrap">
          <h2>Explain the platform through everyday use</h2>
          <div className="glassly-case-intro"><p>Glassly connects miniapps on a phone to supported wearable hardware. The website needed to explain that relationship before asking visitors to explore devices or request early access.</p><p>The story starts with captions, directions and notifications. A wide product image gives the hardware room; a separate sample caption shows the idea without pretending to reproduce the optics of a lens.</p></div>
          <CsImage src={`${base}/website-hero.webp`} aspectRatio="1440 / 744" alt="Original Glassly homepage with the platform headline, Even Realities G2 photograph and a separately labelled sample caption" caption="Original website. Glassly is the platform; Even Realities makes the pictured hardware." />
        </div></section>
        <section id="glassly-demo" className="glassly-case-section"><div className="wrap">
          <h2>Let people see what a miniapp changes</h2>
          <p className="glassly-case-intro">Choose Home, Captions, Navigation, Notifications, Assist or Terminal. The original website demonstration changes the phone interface and glasses output together. Manual selection pauses playback, and the larger mirror keeps the selected scene.</p>
          <GlasslyDemo />
        </div></section>
        <section id="glassly-hardware" className="glassly-case-section"><div className="wrap">
          <h2>Separate the platform from the device</h2>
          <p className="glassly-case-intro">The product story moves from “start with your phone” to supported wearables, then to miniapps and the developer path. Hardware keeps its manufacturer identity. The device catalog distinguishes available hardware, accessories and coming-soon integrations.</p>
          <CsScreenExplorer format="landscape" label="Inspect original Glassly platform screens" screens={[
            {title:'Choose hardware without losing its identity',label:'Device catalog',src:`${base}/devices.webp`,alt:'Original Glassly device catalog with manufacturer names and smart-glasses, accessories and coming-soon filters',caption:'Original website catalog.',decision:{question:'Which part belongs to Glassly, and which belongs to a hardware maker?',choice:'Keep manufacturer names visible and separate device categories and availability.',evidence:'The catalog names Even Realities and other manufacturers, with separate Smart glasses, Accessories and Coming soon filters.',limit:'Availability reflects this captured website; compatibility has not been independently retested.'}},
            {title:'Explain a miniapp through its job',label:'Miniapp discovery',src:`${base}/miniapps.webp`,alt:'Original Glassly miniapp section with Translation, Teleprompter, Recorder and a Terminal illustration',caption:'Original miniapp presentation.',decision:{question:'What would someone use the platform for?',choice:'Describe familiar tasks before introducing the SDK.',evidence:'Translation, Teleprompter and Recorder have short descriptions beside a phone illustration.',limit:'These are product descriptions, not a test of the services or their advertised language coverage.'}},
            {title:'Give builders a separate next step',label:'Developer entry point',src:`${base}/developers.webp`,alt:'Original Glassly developer section linking builders to miniapp SDK documentation',caption:'Original developer section.',decision:{question:'Where does a developer go after understanding the product?',choice:'Offer a dedicated SDK path after the consumer story.',evidence:'The developer section has its own documentation entry point.'}},
          ]} />
        </div></section>
        <section id="glassly-brand" className="glassly-case-section"><div className="wrap">
          <h2>Keep the demonstration honest</h2>
          <p className="glassly-case-intro">The imagery rules keep sample captions outside the lenses, identify illustrative content and credit Even Realities for the pictured G2 hardware. That distinction carries from the homepage into the brand guide.</p>
          <CsImage src={`${base}/brand-13.webp`} aspectRatio="16 / 9" alt="Original Glassly imagery rules: natural proportions, separate sample captions and Even Realities hardware attribution" />
          <details id="glassly-interaction" className="service-source-details">
            <summary>Inspect the visual and interaction guidelines</summary>
            <CsScreenExplorer format="landscape" label="Choose an original Glassly guideline" screens={[
              {title:'Palette',label:'Brand guide · 8',src:`${base}/brand-8.webp`,alt:'Original Glassly color palette',caption:'Cobalt actions, pale-blue product surfaces and midnight demonstration background.'},
              {title:'Typography',label:'Brand guide · 10',src:`${base}/brand-10.webp`,alt:'Original Helvetica Neue typography rules',caption:'Light headings and regular body text, with size and spacing establishing hierarchy.'},
              {title:'Layout',label:'Brand guide · 15',src:`${base}/brand-15.webp`,alt:'Original desktop and mobile Glassly layout guidelines',caption:'Original desktop and mobile reading order.'},
              {title:'Effects',label:'Brand guide · 17',src:`${base}/brand-17.webp`,alt:'Original Glassly grain and frosted-detail guidelines',caption:'Frosted details are confined to captions and controls.'},
              {title:'Motion',label:'Brand guide · 18',src:`${base}/brand-18.webp`,alt:'Original Glassly entrance, control feedback and reduced-motion guidelines',caption:'A single product entrance, brief feedback and reduced-motion behavior.'},
              {title:'Naming',label:'Brand guide · 20',src:`${base}/brand-20.webp`,alt:'Original Glassly voice and product naming guidelines',caption:'Consistent names for the App, Miniapp SDK and Miniapp Store.'},
            ]} />
          </details>
        </div></section>
        <section id="glassly-delivery" className="glassly-case-section"><div className="wrap">
          <h2>Delivered artifacts and open questions</h2>
          <p className="glassly-case-intro">The archive contains the website, its six-scene demonstration and the original brand guide. The demonstration illustrates paired interfaces without connecting to glasses. Adoption, conversion and live hardware behavior are not established here.</p>
          <div className="glassly-case-actions"><a className="glass-action" href={`${base}/brand-guidelines.pdf`} target="_blank" rel="noopener noreferrer">Read the original brand guidelines ↗</a><a className="glass-action" href="https://glassly.ai" target="_blank" rel="noopener noreferrer">Glassly website ↗</a></div>
          <p className="cs-caption">Current external website availability is unverified.</p>
        </div></section>
        <CsThanks contactCta />
      </CsExpandPreview>
      <BottomNav sections={viewMode==='full'?sections:[sections[0]]} modeAction={{label:viewMode==='full'?'Quick overview':'Full case study',onClick:()=>setViewMode(viewMode==='full'?'summary':'full')}} />
    </main>
    <NextProject slug="mentra" title="Mentra" image="/Assets/mockups/projects/mentra_16x9.webp" />
    <Footer />
  </>
}
