/**
 * Subtle 3D-like floating geometric shapes along the page edges.
 * Purely decorative — low opacity, slow floating animation.
 * Hidden on mobile and reduced-motion.
 */

const shapes = [
  // Left side
  { side: 'left', top: '15%', anim: '1', el: <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="8" stroke="var(--ink)" strokeWidth="1.5" transform="rotate(12 24 24)" /></svg> },
  { side: 'left', top: '55%', anim: '3', el: <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="14" stroke="var(--ink)" strokeWidth="1.5" /><circle cx="18" cy="18" r="6" stroke="var(--ink)" strokeWidth="1" /></svg> },

  // Right side
  { side: 'right', top: '30%', anim: '2', el: <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><polygon points="20,2 38,38 2,38" stroke="var(--ink)" strokeWidth="1.5" fill="none" transform="rotate(-8 20 20)" /></svg> },
  { side: 'right', top: '72%', anim: '4', el: <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="4" stroke="var(--ink)" strokeWidth="1.5" transform="rotate(30 16 16)" /><line x1="16" y1="8" x2="16" y2="24" stroke="var(--ink)" strokeWidth="1" /></svg> },
]

export default function EdgeFloats() {
  return (
    <>
      {shapes.map((s) => (
        <div
          key={`${s.side}-${s.top}`}
          className={`edge-float edge-float--${s.side} edge-float--${s.anim}`}
          style={{ top: s.top }}
          aria-hidden="true"
        >
          {s.el}
        </div>
      ))}
    </>
  )
}
