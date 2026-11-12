/**
 * Figma-style frame label — appears above sections like an artboard name.
 * Small blue text in mono font, positioned at top-left of parent section.
 */

export default function FigmaFrameLabel({ name }: { name: string }) {
  return (
    <span className="figma-frame-label" aria-hidden="true">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><rect x="0.5" y="0.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="0.75" /></svg>
      {name}
    </span>
  )
}
