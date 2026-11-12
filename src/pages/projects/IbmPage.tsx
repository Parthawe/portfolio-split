import CsProcessFlow from '../../components/case-study/CsProcessFlow'
import { projectImageProps } from '../../utils/projectImage'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsImage from '../../components/case-study/CsImage'
import CsStatGrid from '../../components/case-study/CsStatGrid'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsCredits from '../../components/case-study/CsCredits'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function IbmPage() {
  return (
    <>
      <Helmet>
        <title>IBM Cancer Prognosis &middot; Parth Pawar</title>
        <meta name="description" content="A compact glimpse of an IBM research internship exploring homomorphic encryption for cancer prognosis without exposing genomic data." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="IBM Cancer Prognosis · Parth Pawar" />
        <meta property="og:description" content="Research glimpse: encrypted genomic computation, prognosis clusters, and what I learned about privacy-preserving AI." />
        <meta property="og:image" content="https://designwhich.works/Assets/Projects/CancerPrognosis/photos/hero-illustration.png" />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#A7D8C9' } as React.CSSProperties}>
        <ProjectHeader
          backLink="/work"
          categorySlug="ai"
          backLabel="Back to Work"
          tags={['Research', 'Healthcare AI', 'Encryption']}
          title="IBM Cancer Prognosis"
          subtitle="A research exploration of computation on encrypted genomic data."
          info={[
            { label: 'Client', value: 'IBM' },
            { label: 'Role', value: 'Research & Engineering' },
            { label: 'Duration', value: '8 Months' },
            { label: 'Year', value: '2020' },
          ]}
        />

        <section className="cs-slide reveal">
          <div className="wrap">
            <img {...projectImageProps("/Assets/Projects/CancerPrognosis/photos/hero-illustration.png")} data-project-preview src="/Assets/Projects/CancerPrognosis/photos/hero-illustration.png" alt="Illustration of people walking toward a glowing open door" loading="eager" />
          </div>
        </section>

        <CsSection id="cs-glimpse" label="Glimpse" title="Encrypted Data, Useful Prognosis">
          <CsBody>
            <p>During an IBM internship, our team explored computation on encrypted genomic data. The diagrams below document the research workflow; the output plot shows how the resulting groups were presented.</p>
          </CsBody>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Problem</span>
            <span className="cs-label-row-val">Genomic data is clinically valuable, but exposing it during computation creates serious privacy risk.</span>
          </div>
          <div className="cs-label-row">
            <span className="cs-label-row-key">Method</span>
            <span className="cs-label-row-val">Use homomorphic encryption so selected genomic features could pass through analysis without being decrypted mid-pipeline.</span>
          </div>
          <div className="cs-label-row project-label-row--open">
            <span className="cs-label-row-key">Result</span>
            <span className="cs-label-row-val">A research pipeline that produced survival-cluster outputs while keeping sensitive data protected through the key computation step.</span>
          </div>
        </CsSection>
        <section className="cs-section"><div className="wrap"><h2 className="cs-section-title">Follow the encrypted workflow</h2><CsBody><p>Select a stage to inspect its role in the documented pipeline. This explains the architecture; it does not process patient information or implement cryptography in the page.</p></CsBody><CsProcessFlow title="Where computation happens" steps={[
          {label:'Prepare features',desc:'The research workflow begins with selected genomic features. The original system diagram below documents the preparation stages.'},
          {label:'Encrypt',desc:'Features enter the protected computation as encrypted values. This separates the useful signal from direct access to the raw patient information.'},
          {label:'Compute',desc:'The homomorphic-encryption model supports selected operations on encrypted values. Follow the original model diagram for the scope of the research pipeline.'},
          {label:'Interpret results',desc:'The recorded outputs include prognosis-group plots. Interpretation requires authorized access and further evaluation; a plot alone does not establish clinical validity.'}
        ]}/></div></section>
        <section className="cs-section reveal">
          <div className="wrap">
            <div className="ibm-diagram-stack" aria-label="Encrypted cancer prognosis system diagrams">
              <figure className="ibm-diagram-card reveal">
                <img {...projectImageProps("/Assets/Projects/ibm/4.jpg")} data-project-preview src="/Assets/Projects/ibm/4.jpg" alt="Encrypted cancer prognosis system flow diagram" loading="lazy" decoding="async" />
                <figcaption>System flow: encrypted genomic features moving through preprocessing, prognosis, clustering, and recommendation steps.</figcaption>
              </figure>
              <figure className="ibm-diagram-card reveal">
                <img {...projectImageProps("/Assets/Projects/ibm/5.jpg")} data-project-preview src="/Assets/Projects/ibm/5.jpg" alt="Homomorphic encryption model diagram for prognosis workflow" loading="lazy" decoding="async" />
                <figcaption>Homomorphic encryption model: computation stays useful without exposing the raw patient data.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <CsSection id="cs-result" label="Result" title="Research output and evaluation limits">
          <CsBody>
            <p>The output was a research workflow and a prognosis-group visualization. The Kaplan-Meier plot shows how the resulting groups were presented. It does not, on its own, establish clinical accuracy, generalizability, or readiness for patient care.</p>
          </CsBody>
          <CsImage
            src="/Assets/Projects/CancerPrognosis/photos/km-clusters-dark.jpg"
            alt="Kaplan-Meier survival cluster plot for seven prognosis groups"
            caption="Research output: Kaplan-Meier curves for seven groups. The plot is an artifact of the study, not evidence of clinical readiness."
          />
          <CsStatGrid stats={[
            { label: 'Reported client runtime', value: '42s' },
            { label: 'Reported server runtime', value: '28s' },
          ]} />
          <CsBody><p>These are the runtimes recorded in the project material. Hardware, workload, and repeat-run details are not included here, so they should not be read as a reproducible benchmark.</p></CsBody>
        </CsSection>

        <section className="cs-section"><div className="wrap"><h2 className="cs-section-title">Publication record</h2><CsBody><p>Co-author Sakshi Oswal lists <cite>Privacy Preserving Cancer Prognosis via Fully Homomorphic Encryption</cite> as an IP.com defensive publication dated May 11, 2022. The original publication document has not been recovered for this case study.</p><a className="glass-action" href="https://in.linkedin.com/in/sakshi-oswal" target="_blank" rel="noopener noreferrer">View the co-author’s publication record</a></CsBody></div></section>

        <CsSection id="cs-learning" label="Learning" title="What I Learned">
          <CsFeatureGrid features={[
            { title: 'Privacy is a system property', desc: 'It is not enough to encrypt data in storage. The risky moment is often the computation itself.' },
            { title: 'Trust needs diagrams', desc: 'For complex technical work, the system flow is part of the UX because it helps reviewers understand where risk enters and exits.' },
            { title: 'Keep evaluation limits visible', desc: 'A pipeline output, a runtime, and clinical validity answer different questions. Each needs its own supporting evaluation.' },
          ]} />
        </CsSection>

        <section className="cs-section reveal">
          <div className="wrap">
            <CsCredits credits={[
              { role: 'IBM Mentors', name: 'Amrin, Varsha' },
              { role: 'College Mentor', name: 'Virendra Pawar' },
              { role: 'Research', name: 'Parth Pawar' },
              { role: 'Engineers', name: 'Sakshi Oswal, Mitanshu Bhoot, Saurabh Rane, Tarun Meditya' },
            ]} />
          </div>
        </section>

        <CsThanks />

        <BottomNav sections={[
          { id: 'cs-glimpse', label: 'Glimpse' },
          { id: 'cs-result', label: 'Result' },
          { id: 'cs-learning', label: 'Learning' },
        ]} />
      </main>

      <NextProject slug="the-point-cdc" title="The Point CDC" image="/Assets/mockups/projects/the-point-cdc_16x9.webp" />
      <Footer />
    </>
  )
}
