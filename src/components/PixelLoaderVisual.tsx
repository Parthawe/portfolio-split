export default function PixelLoaderVisual() {
  const cursorPath = 'M64 174 C150 124 250 110 340 130 C440 154 530 160 620 138 C704 118 792 124 850 154'

  return (
    <div className="loader-orientation" role="status" aria-label="Loading — design which works">
      <div className="loader-stage">
        <svg
          className="loader-signature"
          viewBox="0 0 900 240"
          role="presentation"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id="loaderInkSoftness" x="-12%" y="-18%" width="124%" height="136%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="soft" />
              <feOffset dy="1" result="offset" />
              <feMerge>
                <feMergeNode in="offset" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <text
            className="loader-signature-word"
            x="64"
            y="150"
            textLength="786"
            lengthAdjust="spacingAndGlyphs"
          >
            design which works
          </text>
          <circle className="loader-signature-cursor" r="7">
            <animateMotion
              dur="0.82s"
              begin="0.04s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.16 1 0.3 1"
              keyTimes="0;1"
              path={cursorPath}
            />
          </circle>
        </svg>
      </div>
    </div>
  )
}
