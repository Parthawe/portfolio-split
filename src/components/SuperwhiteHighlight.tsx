const SUPERWHITE_POSTER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQAAAAA3iMLMAAAAAXNSR0IArs4c6QAAAA5JREFUeNpj+P+fgRQEAP1OH+HeyHWXAAAAAElFTkSuQmCC';

interface SuperwhiteHighlightProps {
  className?: string;
}

export default function SuperwhiteHighlight({ className = '' }: SuperwhiteHighlightProps) {
  return (
    <video
      className={className}
      src="/superwhite.mp4"
      poster={SUPERWHITE_POSTER}
      muted
      autoPlay
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onCanPlayThrough={(event) => {
        event.currentTarget.currentTime = 0;
      }}
    />
  );
}
