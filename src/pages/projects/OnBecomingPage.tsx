import RelatedProjectEvidence from '../../components/case-study/RelatedProjectEvidence'
import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsPullquote from '../../components/case-study/CsPullquote'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'

export default function OnBecomingPage() {
  return (
    <>
      <Helmet>
        <title>On Becoming &middot; Parth Pawar</title>
        <meta name="description" content="A reflective essay on artistic identity — finding the thread that connects neural network sculptures, salt-grinding story machines, and fintech payment flows into a single practice." />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#6b7280' } as React.CSSProperties}>

        <ProjectHeader
          showHeaderSummary={false}
          backLink="/work"
          categorySlug="creative-tech"
          backLabel="Back to Work"
          tags={['Writing', 'Reflection', 'Artistic Voice']}
          title="On Becoming"
          subtitle="A reflection on the design questions connecting my software, installations, and physical systems."
          info={[
            { label: 'Context', value: 'On Becoming, NYU ITP' },
            { label: 'Year', value: '2024' },
            { label: 'Format', value: 'Written Essay' },
          ]}
        />

        {/* The Question */}
        <CsSection id="cs-question" label="01 &mdash; The Question" title="What Do You Make?">
          <CsBody>
            <p>I make neural-network sculptures, payment flows, arcade cabinets, story machines, and clocks that slow down near imaginary black holes. For a long time, that felt unfocused.</p>
            <p>On Becoming helped me see the thread: the work is not tied to one medium. It is tied to one question.</p>
          </CsBody>
        </CsSection>

        <CsPullquote quote="How can I design a system that makes an invisible concept tangible enough that you can't help but understand it?" />

        {/* The Thread */}
        <CsSection id="cs-thread" label="02 &mdash; The Thread" title="Making the Invisible Tangible">
          <CsBody>
            <p>Every project is about taking something invisible and making it pass through the body.</p>
            <p><a href="/enigma" className="project-text-link">Enigma</a> turns neural-network computation into cascading light. <a href="/sea-of-salt" className="project-text-link">Why the Sea is Salt</a> turns narrative consequence into grinding salt. <a href="/zentipay" className="project-text-link">ZentiPay</a> turns hidden fees into visible trust. <a href="/shuffle" className="project-text-link">Shuffle</a> turns tradeoffs into coupled motorized faders. <a href="/jugalbandi" className="project-text-link">Jugalbandi</a> turns inference into sound.</p>
            <p>The medium changes. The question stays: how do I make someone understand through the body, not only the brain?</p>
          </CsBody>
        </CsSection>

        {/* The Method */}
        <CsSection id="cs-method" label="03 &mdash; The Method" title="Medium as Meaning">
          <CsBody>
            <p>The choice of medium is never arbitrary. It IS the concept.</p>
            <p>Neural networks become light because activation should be visible. Stories become salt because narrative accumulates. Watches make time mechanical. The <a href="/moniac-machine" className="project-text-link">MONIAC</a> turns economic tradeoffs into a cabinet game inspired by the historic hydraulic computer.</p>
            <p>I look for the medium that already carries the concept&rsquo;s logic, then build an experience around it.</p>
          </CsBody>
        </CsSection>

        {/* The Tension */}
        <CsSection id="cs-tension" label="04 &mdash; The Tension" title="Rigor vs. Imagination">
          <CsBody>
            <p>The product work demands rigor because mistakes can cost people money or attention. The ITP work demands imagination because the patterns do not already exist.</p>
            <p>The tension is the practice. <a href="/mentra" className="project-text-link">Mentra</a> needs both because real-world interruptions have safety implications. <a href="/the-omakase" className="project-text-link">The Omakase</a> needs both because a playful cabinet still has to feel fair.</p>
          </CsBody>
        </CsSection>

        <CsPullquote quote="You do not understand until your body is involved. That's the thesis. Everything else is method." />

        {/* The Name */}
        <CsSection id="cs-name" label="05 &mdash; The Name" title="What Do I Call This?">
          <CsBody>
            <p>&ldquo;Design engineer&rdquo; is accurate but incomplete. &ldquo;Creative technologist&rdquo; is broad but vague. The closest name is this: I build translation layers.</p>
            <p>Systems of medium, constraint, and interaction that turn invisible concepts into visceral experiences. It may not fit neatly on a business card, but it fits the work.</p>
          </CsBody>
        </CsSection>

        <RelatedProjectEvidence slug="on-becoming" />
        <CsThanks />


        <BottomNav sections={[
          { id: 'cs-question', label: 'The Question' },
          { id: 'cs-thread', label: 'The Thread' },
          { id: 'cs-method', label: 'Method' },
          { id: 'cs-tension', label: 'Tension' },
          { id: 'cs-name', label: 'The Name' },
        ]} />

      </main>

      <NextProject slug="enigma" title="Enigma" image="/Assets/images/enigma.jpg" />
      <Footer />
    </>
  )
}
