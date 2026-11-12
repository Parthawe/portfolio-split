import { useRef } from 'react'
import FooterContent from './FooterContent'

export default function Footer({ showArcadeIntro = false }: { showArcadeIntro?: boolean }) {
  const footerRef = useRef<HTMLElement>(null)

  return (
    <footer className="footer" ref={footerRef}>
      <FooterContent footerRef={footerRef} showArcadeIntro={showArcadeIntro} />
    </footer>
  )
}
