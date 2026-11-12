import { memo } from 'react';
import { useBackToTop } from '../hooks/useBackToTop';
import FigmaSelect from './FigmaSelect';

export default memo(function BackToTop() {
  const { visible, scrollToTop } = useBackToTop();

  return (
    <button
      className={`back-to-top figma-hover${visible ? ' visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 16 16" fill="none">
        <path
          d="M8 14V4M4 7l4-4 4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <FigmaSelect />
    </button>
  );
})
