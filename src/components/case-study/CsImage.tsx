import { useState } from 'react';
import { projectImageProps } from '../../utils/projectImage';

interface CsImageProps {
  src?: string;
  alt?: string;
  caption?: string;
  /** Reserve the frame before the image loads. */
  aspectRatio?: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CsImage({ src, alt, caption, aspectRatio, placeholder, className, style }: CsImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (!src) {
    return placeholder ? <div className="cs-img-placeholder"><span className="cs-img-placeholder-text">{placeholder}</span></div> : null;
  }

  return (
    <figure className={`cs-img-full ${className || ''}`} style={style}>
      {failedSource === src ? (
        <div className="cs-image-unavailable" role="status" style={aspectRatio ? { aspectRatio } : undefined}>
          <p>This image couldn’t load.</p>
          {alt && <p>{alt}</p>}
          <button type="button" onClick={() => setFailedSource(null)}>Retry image</button>
          <a href={src} target="_blank" rel="noopener noreferrer">Open the original image</a>
        </div>
      ) : (
        <img
          data-project-preview
          data-original-src={src}
          {...projectImageProps(src)}
          src={src}
          alt={alt || ''}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSource(src)}
          style={aspectRatio ? { aspectRatio, objectFit: 'contain', width: '100%' } : undefined}
        />
      )}
      {caption && <figcaption className="cs-img-caption">{caption}</figcaption>}
    </figure>
  );
}
