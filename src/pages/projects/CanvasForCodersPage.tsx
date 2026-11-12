import { Helmet } from 'react-helmet-async'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import ProjectHeader from '../../components/case-study/ProjectHeader'
import CsExpandPreview from "../../components/case-study/CsExpandPreview"
import CsSection from '../../components/case-study/CsSection'
import CsBody from '../../components/case-study/CsBody'
import CsFeatureGrid from '../../components/case-study/CsFeatureGrid'
import CsThanks from '../../components/case-study/CsThanks'
import BottomNav from '../../components/case-study/BottomNav'
import NextProject from '../../components/case-study/NextProject'
import GenerativeCanvas from '../../components/GenerativeCanvas'

export default function CanvasForCodersPage() {
  return (
    <>
      <Helmet>
        <title>Flow Fields &middot; Parth Pawar</title>
        <meta name="description" content="Generative flow field art — 2000 particles driven by Perlin noise, interactive mouse attraction, and color palette exploration. Canvas for Coders, NYU ITP." />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Flow Fields · Parth Pawar" />
        <meta property="og:description" content="Generative art: Perlin noise flow fields with interactive particle systems." />
      </Helmet>

      <Nav />

      <main id="main-content" className="project-main" style={{ '--project-color': '#5390d9' } as React.CSSProperties}>

        <ProjectHeader
          backLink="/work"
          categorySlug="creative-tech"
          backLabel="Back to Work"
          tags={['Creative Coding', 'Generative Art', 'Interactive']}
          title="Flow Fields"
          subtitle="Generative particle systems driven by Perlin noise &mdash; exploring how simple rules create complex beauty"
          info={[
            { label: 'Context', value: 'Canvas for Coders, NYU ITP' },
            { label: 'Year', value: '2024' },
            { label: 'Role', value: 'Creative Coder' },
            { label: 'Tools', value: 'TypeScript, Canvas API, Perlin Noise' },
          ]}
        />

        {/* Interactive — first thing you see */}
        <CsExpandPreview>
        <CsSection id="cs-interactive" label="Interactive" title="Play with the Flow">
          <CsBody>
            <p>Move your mouse across the canvas to attract particles. Each one follows a Perlin noise flow field &mdash; invisible currents that push and pull them into organic, ever-changing patterns. Switch color palettes to change the mood. Increase particle density for richer fields.</p>
          </CsBody>
          <div className="project-content-block">
            <GenerativeCanvas />
          </div>
        </CsSection>

        {/* Concept */}
        <CsSection id="cs-concept" label="01 &mdash; Concept" title="Simple Rules, Complex Beauty">
          <CsBody>
            <p>Flow fields are one of the oldest ideas in generative art: assign a direction to every point in space, then let particles follow those directions. The result is a visual system that feels organic and alive &mdash; currents, eddies, and streams emerge from pure mathematics.</p>
            <p>This piece uses Perlin noise to generate the flow field &mdash; a smooth, continuous noise function that creates naturalistic patterns. Unlike random noise, Perlin noise has structure: nearby points have similar values, creating the flowing, wind-like quality that makes these fields visually compelling.</p>
            <p>The interactive layer adds a human element: your cursor creates a gravitational well that bends the flow around your presence. You can shepherd particles into tight spirals, scatter them across the canvas, or simply watch the noise evolve on its own. The tension between algorithmic autonomy and human intervention is the core of the piece.</p>
          </CsBody>
        </CsSection>

        {/* Technical */}
        <CsSection id="cs-technical" label="02 &mdash; Technical" title="How It Works">
          <CsFeatureGrid features={[
            { title: 'Perlin Noise Field', desc: '2D Perlin noise sampled at each particle position, evolving over time. The noise value at each point determines the angle of the flow vector — particles follow the gradient like leaves in wind.' },
            { title: '2000 Particles', desc: 'Each particle has position, velocity, and a finite lifespan. When a particle dies, it respawns at a random location with a new color from the active palette — ensuring the field constantly renews itself.' },
            { title: 'Trail Persistence', desc: 'Instead of clearing the canvas each frame, a semi-transparent rectangle is drawn over the entire canvas. This creates persistent trails that fade slowly — the visual memory of where particles have been.' },
            { title: 'Mouse Attraction', desc: 'When the cursor is active, particles within 200px are attracted toward it with force inversely proportional to distance. This creates spiraling vortex patterns around the cursor.' },
            { title: 'Velocity Damping', desc: 'Each frame, velocity is multiplied by 0.96 — a 4% reduction. This prevents particles from accelerating indefinitely and creates the smooth, flowing motion rather than chaotic bouncing.' },
            { title: 'Color Palettes', desc: 'Five curated palettes (Ocean, Ember, Forest, Neon, Mono) each with five colors. Particles are randomly assigned a color on spawn, creating rich chromatic variation within a cohesive aesthetic.' },
          ]} />
        </CsSection>

        {/* Context */}
        <CsSection id="cs-context" label="03 &mdash; Context" title="Canvas for Coders">
          <CsBody>
            <p>This piece was developed during Canvas for Coders at NYU ITP (Fall 2024), a course focused on creative coding as an artistic practice. The course explored generative systems, computational aesthetics, and the intersection of programming and visual art.</p>
            <p>The flow field exercise started as a technical study &mdash; implementing Perlin noise from scratch, understanding gradient vectors, building a particle system with proper physics. But the moment the trails appeared on screen, it became clear that the system had its own aesthetic voice. The challenge shifted from &ldquo;how do I make this work?&rdquo; to &ldquo;how do I get out of its way?&rdquo;</p>
            <p>The most important lesson: generative art is not about controlling every pixel. It&rsquo;s about designing the rules and letting the system surprise you. The best moments in this piece are the ones I didn&rsquo;t plan &mdash; the way particles cluster at flow field boundaries, the spirals that form spontaneously near saddle points in the noise, the color gradients that emerge from random particle lifespans.</p>
          </CsBody>
        </CsSection>

        <CsThanks />

        </CsExpandPreview>

        <BottomNav sections={[
          { id: 'cs-interactive', label: 'Interactive' },
          { id: 'cs-concept', label: 'Concept' },
          { id: 'cs-technical', label: 'Technical' },
          { id: 'cs-context', label: 'Context' },
        ]} />

      </main>

      <NextProject slug="enigma" title="Enigma" image="/Assets/images/enigma.jpg" />
      <Footer />
    </>
  )
}
