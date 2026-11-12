type PointerCursorGlyphProps = {
  className?: string
  size?: number
}

export default function PointerCursorGlyph({ className, size = 24 }: PointerCursorGlyphProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M18.2 8.4C12.9 4.7 5.8 9 6.6 15.4l4.8 39.9c0.8 6.3 8.8 8.2 12.3 2.9l9.3-14.1c1.2-1.8 3.1-2.9 5.3-3l17-0.9c6.5-0.3 9-8.7 3.7-12.4L18.2 8.4Z"
        fill="currentColor"
        stroke="var(--pointer-cursor-stroke, #fff)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
