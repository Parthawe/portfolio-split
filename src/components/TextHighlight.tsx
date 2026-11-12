import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-triggered text highlight — words get an accent background
 * as they scroll into view, like a highlighter pen drawing across text.
 */

interface Props {
  children: string
  /** Highlight color — defaults to accent orange */
  color?: string
  /** Tag to render — h2, h3, p, span */
  as?: 'h2' | 'h3' | 'p' | 'span'
  className?: string
}

export default function TextHighlight({ children, color, as: Tag = 'span', className = '' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        io.disconnect()
      },
      { threshold: 0.15, rootMargin: '0px 0px -24% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible])

  return (
    <Tag ref={ref as React.Ref<never>} className={`text-highlight ${visible ? 'is-visible ' : ''}${className}`}>
      <span className="text-highlight-text">{children}</span>
      <span
        className="text-highlight-mark"
        style={{
          backgroundColor: color || 'var(--highlight-color, rgba(232, 93, 38, 0.15))',
        }}
      />
    </Tag>
  )
}
