import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import ShuffleInteractive from '../components/ShuffleInteractive'

export default function ShuffleSimulationPage() {
  return (
    <main className="shuffle-simulation-page">
      <Helmet><title>Shuffle · 3D simulation</title><meta name="description" content="Explore a 3D reconstruction of Shuffle, a motorized slider installation about student life at ITP." /></Helmet>
      <header>
        <div><h1>Shuffle</h1><p>A physical study of student life at ITP.</p></div>
        <Link to="/shuffle">Back to the project</Link>
        <ThemeToggle />
      </header>
      <ShuffleInteractive />
      <nav className="shuffle-room-nav" aria-label="Project experiences"><Link to="/project-experiences">All experiences</Link></nav>
    </main>
  )
}
