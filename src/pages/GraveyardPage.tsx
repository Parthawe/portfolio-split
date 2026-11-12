import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { lockBodyScroll, unlockBodyScroll } from '../utils/bodyScrollLock';
import '../styles/graveyard.css';

interface PortfolioVersion {
  id: string;
  year: string;
  era: string;
  epitaph: string;
  platform: string;
  description: string;
  colors: [string, string, string];
  url?: string;
  archiveUrl?: string;
  features: string[];
  status: 'dead' | 'archived' | 'alive';
  born?: string;
  died?: string;
}

const VERSIONS: PortfolioVersion[] = [
  {
    id: 'react-2026',
    year: '2026',
    era: 'React + 3D',
    epitaph: 'Still breathing... for now',
    platform: 'React 19 + Vite + Bun',
    description: 'The one you\'re on. React 19, Three.js, hand tracking, aurora gradients, and this very page.',
    colors: ['#1A1A1A', '#FAFAF8', '#666666'],
    url: '/',
    features: ['React 19', 'Three.js hero', 'Hand tracking', 'Lenis scroll', 'PDF flipbook'],
    status: 'alive',
    born: 'Jan 2026',
  },
  {
    id: 'cargo-2024',
    year: '2024',
    era: 'The Cargo Era',
    epitaph: 'A brief affair with a beautiful CMS',
    platform: 'Cargo.site',
    description: 'Parallel portfolio on Cargo. Custom fonts (Diatype Variable, Butlers Slice), audience-targeted tabs, minimalist grid.',
    colors: ['#222222', '#FFFFFF', '#888888'],
    url: 'https://designwhich.works',
    features: ['Cargo CMS', 'Custom fonts', 'Audience tabs', 'Minimalist grid'],
    status: 'alive',
    born: 'Jun 2024',
  },
  {
    id: 'overhaul-2024',
    year: '2024',
    era: 'Full UI Overhaul',
    epitaph: 'The last of the static era',
    platform: 'GitHub Pages',
    description: 'Pill navigation, dark hero, logo marquee, per-project color theming. The editorial vision fully realized.',
    colors: ['#1A1A1A', '#FAFAF8', '#666666'],
    features: ['Pill navigation', 'Dark hero', 'Logo marquee', 'Per-project colors'],
    status: 'dead',
    born: 'Sep 2024',
    died: 'Dec 2024',
  },
  {
    id: 'editorial-2024',
    year: '2024',
    era: 'Serif Editorial',
    epitaph: 'Looked great in screenshots, lived briefly',
    platform: 'GitHub Pages',
    description: 'Serif typography meets editorial craft. Satoshi + Cormorant. Dark mode, dot-grid backgrounds, sticky stacking cards.',
    colors: ['#C9A87C', '#111110', '#EDEDEC'],
    features: ['Satoshi + Cormorant', 'Dark mode', 'Sticky stacking', 'Dot-grid background'],
    status: 'dead',
    born: 'May 2024',
    died: 'Aug 2024',
  },
  {
    id: 'minimal-white-2024',
    year: '2024',
    era: 'Minimal White',
    epitaph: 'Less was more, until it was nothing',
    platform: 'GitHub Pages',
    description: 'Ground-up rewrite. Inter + Manrope. Warm off-white, generous whitespace, Three.js hero, custom cursor.',
    colors: ['#e84393', '#FAFAF8', '#1A1A1A'],
    features: ['Inter + Manrope', 'Three.js hero', 'Custom cursor', 'Swiper carousel'],
    status: 'dead',
    born: 'Feb 2024',
    died: 'Apr 2024',
  },
  {
    id: 'behance',
    year: '2020\u20142024',
    era: 'Behance',
    epitaph: 'The portfolio everyone checks but nobody admits',
    platform: 'Behance',
    description: 'Case studies and visual work on the platform recruiters already know.',
    colors: ['#1769FF', '#FFFFFF', '#191919'],
    url: 'https://www.behance.net/artwithparth',
    features: ['Case studies', 'Visual work', 'Behance community'],
    status: 'alive',
    born: 'Sep 2020',
  },
  {
    id: 'interactions-2023',
    year: '2023',
    era: 'Adding Interactions',
    epitaph: 'Learned to move, but couldn\'t find its voice',
    platform: 'GitHub Pages',
    description: 'Scroll-triggered animations, cubic-bezier easing, hover transforms. Still Webflow under the hood.',
    colors: ['#5B8FDB', '#FFFFFF', '#222222'],
    features: ['Scroll animations', 'Cubic-bezier easing', 'Hover transforms', 'Data-attribute states'],
    status: 'dead',
    born: 'Aug 2023',
    died: 'Jan 2024',
  },
  {
    id: 'webflow-2023',
    year: '2023',
    era: 'The Webflow Era',
    epitaph: 'Born from a template, died with dignity',
    platform: 'Webflow \u2192 GitHub Pages',
    description: 'My first portfolio \u2014 exported from Webflow and hosted on GitHub Pages. 210+ files, 75MB of assets, and a dream.',
    colors: ['#4A7FD0', '#F5F5F5', '#1A1A1A'],
    features: ['Webflow export', 'Static HTML/CSS', 'Card grid layout', '7+ project pages'],
    status: 'archived',
    born: 'Mar 2023',
    died: 'Jul 2023',
  },
  {
    id: 'book-2022',
    year: '2022',
    era: 'The Book',
    epitaph: '62 pages of ambition, bound in a PDF',
    platform: 'PDF Flipbook',
    description: 'A 62-page portfolio book designed before discovering React. UX design, interaction design, and engineering projects presented as a bound flipbook.',
    colors: ['#3a2f24', '#FAFAF8', '#6a5a48'],
    url: '/book',
    features: ['62 pages', 'PDF flipbook', 'Pre-React era', 'Bound portfolio'],
    status: 'archived',
    born: 'Oct 2022',
    died: 'Feb 2023',
  },
];

/* ── SVG filters for hand-drawn feel ── */
function SvgFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="sketchy">
          <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" seed="2" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="paint-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="4" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feBlend in="SourceGraphic" in2="mono" mode="multiply" />
        </filter>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════
   ATMOSPHERE, Painterly Ghibli-style
   ═══════════════════════════════════════ */

/* PaintNoise removed, cleaner look */

/* Sun, flat paper-cut style */
function Sun() {
  return (
    <div className="gy-sun" aria-hidden="true">
      <svg className="gy-sun-svg" viewBox="0 0 120 120" fill="none">
        {/* Paper rays, triangular spikes */}
        {Array.from({ length: 16 }).map((_, i) => (
          <polygon
            key={i}
            points={i % 2 === 0
              ? '60,8 55,30 65,30'   /* long rays */
              : '60,18 57,30 63,30'  /* short rays */
            }
            fill="#F4B860"
            opacity={i % 2 === 0 ? 0.7 : 0.45}
            transform={`rotate(${i * 22.5} 60 60)`}
          />
        ))}
        {/* Paper disc */}
        <circle cx="60" cy="60" r="26" fill="#FCEABB" />
        <circle cx="60" cy="60" r="26" fill="none" stroke="#F0D68A" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  );
}

/* Moon, flat paper-cut crescent */
function Moon() {
  return (
    <div className="gy-moon" aria-hidden="true">
      <svg className="gy-moon-svg" viewBox="0 0 80 80" fill="none">
        {/* Full disc */}
        <circle cx="40" cy="40" r="28" fill="#E8E4D8" />
        {/* Shadow circle creates crescent, offset to carve out a crescent shape */}
        <circle cx="52" cy="32" r="24" fill="#0A0F20" className="gy-moon-shadow-circle" />
        {/* Paper craters, flat circles */}
        <circle cx="32" cy="44" r="4" fill="#D8D4C8" opacity="0.5" />
        <circle cx="28" cy="56" r="2.5" fill="#D8D4C8" opacity="0.4" />
        <circle cx="38" cy="52" r="3" fill="#D8D4C8" opacity="0.35" />
      </svg>
    </div>
  );
}

/* Stars with twinkle */
function Stars() {
  const stars = useMemo(() =>
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${(i * 41 + 7) % 100}%`,
      top: `${(i * 29 + 3) % 60}%`,
      size: i < 5 ? 3 : (1 + (i % 3)),
      delay: `${(i * 0.23) % 4}s`,
      duration: `${2 + (i % 4)}s`,
      bright: i < 10,
    })),
  []);

  return (
    <div className="gy-stars" aria-hidden="true">
      {stars.map(s => (
        <span
          key={s.id}
          className={`gy-star ${s.bright ? 'gy-star--bright' : ''}`}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
      <div className="gy-shooting-star" />
      <div className="gy-shooting-star gy-shooting-star--2" />
    </div>
  );
}

/* Fireflies, floating in lower scene */
function Fireflies() {
  const flies = useMemo(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 31 + 10) % 90 + 5}%`,
      top: `${50 + (i * 13) % 40}%`,
      delay: `${(i * 0.7) % 5}s`,
      duration: `${4 + (i % 3) * 2}s`,
    })),
  []);

  return (
    <div className="gy-fireflies" aria-hidden="true">
      {flies.map(f => (
        <span
          key={f.id}
          className="gy-firefly"
          style={{
            left: f.left,
            top: f.top,
            animationDelay: f.delay,
            animationDuration: f.duration,
          }}
        />
      ))}
    </div>
  );
}

/* Clouds, flat paper-cut shapes with clean edges */
function CloudA({ className }: { className?: string }) {
  return (
    <svg className={`gy-cloud ${className || ''}`} viewBox="0 0 260 80" fill="currentColor" aria-hidden="true">
      <path d="M30 60 Q30 32 58 32 Q62 14 90 14 Q110 2 140 10 Q160 0 185 14 Q220 10 235 30 Q255 30 255 48 Q255 60 240 60Z" />
    </svg>
  );
}
function CloudB({ className }: { className?: string }) {
  return (
    <svg className={`gy-cloud ${className || ''}`} viewBox="0 0 200 65" fill="currentColor" aria-hidden="true">
      <path d="M20 50 Q20 30 45 28 Q52 12 78 14 Q95 4 118 12 Q140 6 158 18 Q180 14 190 30 Q200 32 200 44 Q200 50 188 50Z" />
    </svg>
  );
}

/* Light rays, diagonal golden beams from sun */
function LightRays() {
  return (
    <div className="gy-light-rays" aria-hidden="true">
      <div className="gy-ray gy-ray--1" />
      <div className="gy-ray gy-ray--2" />
      <div className="gy-ray gy-ray--3" />
      <div className="gy-ray gy-ray--4" />
    </div>
  );
}

/* Trees, organic watercolor-style with varied canopy shapes */
function TreeLarge({ className }: { className?: string }) {
  return (
    <svg className={`gy-tree ${className || ''}`} viewBox="0 0 300 450" aria-hidden="true">
      {/* Trunk, thick, gnarled, organic */}
      <path d="M130 450 C128 400 120 360 115 330 C108 300 100 280 95 265 Q105 275 115 290 C110 260 105 240 98 225 Q110 240 118 255 C115 230 112 215 108 200 Q115 210 120 225 L120 190 Q118 175 115 165 Q120 175 125 190 L125 450Z" fill="var(--gy-trunk, #5C4033)" />
      <path d="M140 450 C142 400 148 360 152 330 C155 300 160 280 165 265 Q158 275 150 290 C153 260 158 240 162 225 Q155 240 148 255 C150 230 152 215 155 200 Q150 210 145 225 L145 190 Q147 175 150 165 Q145 175 140 190 L140 450Z" fill="var(--gy-trunk-dark, #4A3428)" />
      {/* Main canopy, large overlapping organic shapes */}
      <path d="M135 160 C80 158 30 130 45 90 C55 60 90 35 135 30 C180 25 220 50 230 85 C240 120 200 155 135 160Z" fill="var(--gy-leaf-1, #3A6B28)" />
      <path d="M80 170 C30 165 0 140 15 105 C25 80 55 60 90 55 C125 50 155 65 160 95 C168 130 135 170 80 170Z" fill="var(--gy-leaf-2, #2D5A1E)" />
      <path d="M190 155 C235 148 270 120 258 85 C250 60 220 42 185 40 C155 38 130 55 125 80 C118 110 150 150 190 155Z" fill="var(--gy-leaf-3, #4A7B35)" />
      {/* Top tuft */}
      <path d="M135 55 C110 52 85 35 95 15 C102 0 125 -5 145 5 C165 12 175 35 160 50 C150 58 135 58 135 55Z" fill="var(--gy-leaf-3, #4A7B35)" opacity="0.9" />
      {/* Highlights */}
      <ellipse cx="100" cy="100" rx="35" ry="25" fill="var(--gy-leaf-hi, #6A9B50)" opacity="0.3" />
      <ellipse cx="160" cy="75" rx="25" ry="18" fill="var(--gy-leaf-hi, #6A9B50)" opacity="0.2" />
    </svg>
  );
}

function TreeMedium({ className }: { className?: string }) {
  return (
    <svg className={`gy-tree ${className || ''}`} viewBox="0 0 220 360" aria-hidden="true">
      {/* Trunk, slightly curved */}
      <path d="M100 360 C98 320 95 290 92 270 C88 250 84 235 80 225 Q90 232 96 245 C93 225 90 210 86 200 Q94 210 100 225 L100 360Z" fill="var(--gy-trunk, #5C4033)" />
      <path d="M112 360 C114 320 118 290 120 270 C122 250 125 235 128 225 Q122 232 116 245 C118 225 120 210 123 200 Q118 210 112 225 L112 360Z" fill="var(--gy-trunk-dark, #4A3428)" />
      {/* Canopy, rounder, softer */}
      <path d="M108 135 C60 132 25 108 38 72 C48 45 78 25 110 22 C142 19 170 38 178 68 C186 98 155 132 108 135Z" fill="var(--gy-leaf-1, #3A6B28)" />
      <path d="M65 148 C22 142 -2 118 12 88 C22 65 48 48 78 46 C108 44 132 58 136 82 C142 112 105 145 65 148Z" fill="var(--gy-leaf-2, #2D5A1E)" />
      <path d="M155 140 C192 134 215 110 205 80 C198 58 172 42 145 40 C120 38 100 52 96 72 C90 98 125 135 155 140Z" fill="var(--gy-leaf-3, #4A7B35)" />
      <ellipse cx="85" cy="95" rx="25" ry="18" fill="var(--gy-leaf-hi, #6A9B50)" opacity="0.28" />
    </svg>
  );
}

function TreeSmall({ className }: { className?: string }) {
  return (
    <svg className={`gy-tree ${className || ''}`} viewBox="0 0 150 240" aria-hidden="true">
      <path d="M68 240 L68 160 C66 148 62 140 58 135 Q65 140 70 148 L70 240Z" fill="var(--gy-trunk, #5C4033)" />
      <path d="M78 240 L78 148 Q82 140 86 135 Q82 145 78 160 L78 240Z" fill="var(--gy-trunk-dark, #4A3428)" />
      {/* Compact round canopy */}
      <path d="M75 110 C40 108 15 88 25 60 C32 40 55 25 75 22 C95 19 118 35 125 58 C132 82 108 108 75 110Z" fill="var(--gy-leaf-1, #3A6B28)" />
      <path d="M50 118 C20 114 5 96 14 72 C20 55 40 42 58 40 C78 38 95 50 98 68 C102 90 75 115 50 118Z" fill="var(--gy-leaf-2, #2D5A1E)" />
      <path d="M100 112 C125 108 140 90 132 68 C126 52 108 40 90 38 C74 36 60 46 56 62 C50 82 78 108 100 112Z" fill="var(--gy-leaf-3, #4A7B35)" />
      <ellipse cx="60" cy="78" rx="18" ry="12" fill="var(--gy-leaf-hi, #6A9B50)" opacity="0.25" />
    </svg>
  );
}

/* Bush clusters for ground detail */
function Bushes() {
  return (
    <div className="gy-bushes" aria-hidden="true">
      <svg className="gy-bush gy-bush--1" viewBox="0 0 120 60">
        <ellipse cx="60" cy="35" rx="55" ry="28" fill="var(--gy-leaf-2, #2D5A1E)" />
        <ellipse cx="35" cy="40" rx="35" ry="22" fill="var(--gy-leaf-1, #3A6B28)" />
        <ellipse cx="85" cy="38" rx="32" ry="24" fill="var(--gy-leaf-3, #4A7B35)" />
        <ellipse cx="60" cy="28" rx="30" ry="18" fill="var(--gy-leaf-hi, #6A9B50)" opacity="0.3" />
      </svg>
      <svg className="gy-bush gy-bush--2" viewBox="0 0 90 50">
        <ellipse cx="45" cy="30" rx="42" ry="22" fill="var(--gy-leaf-1, #3A6B28)" />
        <ellipse cx="25" cy="34" rx="28" ry="18" fill="var(--gy-leaf-2, #2D5A1E)" />
        <ellipse cx="65" cy="32" rx="26" ry="20" fill="var(--gy-leaf-3, #4A7B35)" />
      </svg>
      <svg className="gy-bush gy-bush--3" viewBox="0 0 100 55">
        <ellipse cx="50" cy="32" rx="48" ry="25" fill="var(--gy-leaf-2, #2D5A1E)" />
        <ellipse cx="30" cy="36" rx="30" ry="20" fill="var(--gy-leaf-1, #3A6B28)" />
        <ellipse cx="72" cy="34" rx="30" ry="22" fill="var(--gy-leaf-3, #4A7B35)" />
        <ellipse cx="50" cy="24" rx="24" ry="14" fill="var(--gy-leaf-hi, #6A9B50)" opacity="0.25" />
      </svg>
    </div>
  );
}

/* Rolling hills, 3 layers for depth */
function Hills() {
  return (
    <div className="gy-hills-wrap" aria-hidden="true">
      {/* Far hills, blurred for depth */}
      <svg className="gy-hill gy-hill--far" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0 100 C160 40, 340 20, 520 70 C700 120, 840 30, 1020 60 C1200 90, 1350 30, 1440 80 L1440 200 L0 200Z" fill="var(--gy-hill-far, #8BAF6A)" />
      </svg>
      {/* Mid hills */}
      <svg className="gy-hill gy-hill--mid" viewBox="0 0 1440 180" preserveAspectRatio="none">
        <path d="M0 120 C180 60, 360 80, 540 100 C720 120, 880 50, 1060 80 C1240 110, 1380 60, 1440 100 L1440 180 L0 180Z" fill="var(--gy-hill-mid, #6B8F4A)" />
      </svg>
      {/* Front ground */}
      <svg className="gy-hill gy-hill--front" viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path d="M0 80 C200 55, 400 70, 600 60 C800 50, 1000 65, 1200 55 C1350 48, 1400 60, 1440 50 L1440 140 L0 140Z" fill="var(--gy-hill-front, #5A7B3A)" />
      </svg>
    </div>
  );
}

/* Wildflowers, colorful dots scattered on ground */
function Wildflowers() {
  const flowers = useMemo(() => {
    const colors = ['#E87B7B', '#F4A261', '#E9C46A', '#D4A5E5', '#F8E1EE', '#FFFFFF', '#FFD6E0', '#C4E8A8'];
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${(i * 2.6 + (i % 3) * 0.7)}%`,
      bottom: `${(i * 7) % 18}%`,
      size: 3 + (i % 4),
      color: colors[i % colors.length],
      delay: `${(i * 0.15) % 3}s`,
    }));
  }, []);

  return (
    <div className="gy-flowers" aria-hidden="true">
      {flowers.map(f => (
        <span
          key={f.id}
          className="gy-flower"
          style={{
            left: f.left,
            bottom: f.bottom,
            width: f.size,
            height: f.size,
            backgroundColor: f.color,
            animationDelay: f.delay,
          }}
        />
      ))}
    </div>
  );
}

/* Birds, small V shapes in the sky */
function Birds() {
  return (
    <div className="gy-birds" aria-hidden="true">
      {[
        { left: '15%', top: '12%', size: 12, delay: '0s' },
        { left: '18%', top: '14%', size: 10, delay: '0.3s' },
        { left: '35%', top: '8%', size: 14, delay: '1s' },
        { left: '38%', top: '10%', size: 9, delay: '1.2s' },
        { left: '65%', top: '16%', size: 11, delay: '2s' },
        { left: '72%', top: '6%', size: 8, delay: '0.5s' },
      ].map((b, i) => (
        <svg
          key={i}
          className="gy-bird"
          style={{ left: b.left, top: b.top, width: b.size, animationDelay: b.delay }}
          viewBox="0 0 20 10"
          fill="none"
        >
          <path d="M0 8 Q5 0 10 6 Q15 0 20 8" stroke="var(--gy-bird-color, rgba(60,50,40,0.3))" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ))}
    </div>
  );
}

/* Main atmosphere wrapper */
function GraveyardAtmosphere() {
  return (
    <div className="gy-atmo" aria-hidden="true">
      <div className="gy-sky" />
      <div className="gy-color-wash" />

      {/* Both always in DOM, CSS handles the sunset/moonrise transition */}
      <Sun />
      <Moon />
      <Stars />
      <LightRays />
      <Birds />

      {/* Clouds, blurred for softness */}
      <CloudA className="gy-cloud--1" />
      <CloudB className="gy-cloud--2" />
      <CloudA className="gy-cloud--3" />
      <CloudB className="gy-cloud--4" />

      {/* Trees, layered for depth */}
      <TreeLarge className="gy-tree--1" />
      <TreeMedium className="gy-tree--2" />
      <TreeSmall className="gy-tree--3" />
      <TreeLarge className="gy-tree--4" />
      <TreeSmall className="gy-tree--5" />

      <Bushes />
      <Hills />
      <Wildflowers />
      <Fireflies />

      {/* Mist layer near ground */}
      <div className="gy-mist" />

      {/* Fade atmosphere into page content */}
      <div className="gy-atmo-fade" />
    </div>
  );
}

/* ═══════════════════════════════════════
   TOMBSTONE CARD
   ═══════════════════════════════════════ */

const tombItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

function GraveCard({ version, onPreview }: { version: PortfolioVersion; onPreview?: (v: PortfolioVersion) => void }) {
  const [dug, setDug] = useState(false);
  const navigate = useNavigate();
  const isDead = version.status === 'dead' || version.status === 'archived';

  const handleStoneClick = () => {
    setDug(prev => !prev);
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (version.archiveUrl && onPreview) {
      onPreview(version);
    } else if (version.url && version.url.startsWith('/') && version.url !== '/') {
      navigate(version.url);
    } else if (version.url && version.url !== '/') {
      window.open(version.url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasAction = !!(version.archiveUrl || (version.url && version.url !== '/'));
  const actionLabel = version.archiveUrl
    ? 'Dig up'
    : version.url?.startsWith('/') ? 'Visit' : 'Visit';

  return (
    <motion.article className={`gy-tomb gy-tomb--${version.status}`} variants={tombItem}>
      {/* The gravestone, click to unearth */}
      <div className="gy-tomb-stone" onClick={handleStoneClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStoneClick(); } }} role="button" tabIndex={0}>
        {/* Engraved inscription */}
        <div className="gy-tomb-inscription">
          <span className="gy-tomb-symbol">
            {version.status === 'alive' ? '\u2727' : '\u271D'}
          </span>

          <h3 className="gy-tomb-era">{version.era}</h3>
          <span className="gy-tomb-year">{version.year}</span>

          <div className="gy-tomb-rule-engrave" />

          <p className="gy-tomb-epitaph">&ldquo;{version.epitaph}&rdquo;</p>

          {version.born && (
            <div className="gy-tomb-lifespan">
              <span>{version.born}</span>
              <span className="gy-tomb-lifespan-dash">&mdash;</span>
              <span>{version.died || 'Present'}</span>
            </div>
          )}

          <span className="gy-tomb-platform">{version.platform}</span>
        </div>

        {/* Cracks on dead stones */}
        {isDead && <div className="gy-tomb-crack" />}
        {isDead && <div className="gy-tomb-crack gy-tomb-crack--2" />}

        {/* Moss creep at base */}
        <div className="gy-tomb-moss" />
      </div>

      {/* Soil mound at base */}
      <div className={`gy-tomb-soil ${dug ? 'gy-tomb-soil--dug' : ''}`}>
        <svg className="gy-tomb-soil-svg" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 C20 28 40 18 60 14 C80 10 100 8 120 10 C140 12 160 18 180 24 C190 28 198 34 200 40Z" fill="var(--gy-soil, #6B5B4A)" />
          <path d="M10 40 C30 32 50 24 70 20 C90 16 110 14 130 16 C150 18 170 24 190 32 L200 40Z" fill="var(--gy-soil-dark, #5A4A3A)" />
        </svg>
        {/* Small ground flowers */}
        <span className="gy-tomb-ground-flower" />
        <span className="gy-tomb-ground-flower gy-tomb-ground-flower--2" />
        <span className="gy-tomb-ground-flower gy-tomb-ground-flower--3" />
      </div>

      {/* Unearthed details, revealed when clicking the stone */}
      <div className={`gy-tomb-details ${dug ? 'gy-tomb-details--open' : ''}`}>
        <p className="gy-tomb-desc">{version.description}</p>
        <div className="gy-tomb-tags">
          {version.features.map((f) => (
            <span key={f} className="gy-tomb-tag">{f}</span>
          ))}
        </div>
        {hasAction && (
          <button className="gy-tomb-cta" onClick={handleAction}>
            {actionLabel}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10L10 2M10 2H4.5M10 2V7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>
    </motion.article>
  );
}

/* ── Iframe preview overlay ── */
function IframePreview({ url, era, onClose }: { url: string; era: string; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();

      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>('button, iframe, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    lockBodyScroll('graveyard-preview');
    window.addEventListener('keydown', handleKey);
    return () => {
      unlockBodyScroll('graveyard-preview');
      window.removeEventListener('keydown', handleKey);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="gy-preview-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${era}`}
    >
      <div className="gy-preview-chrome" onClick={(e) => e.stopPropagation()}>
        <div className="gy-preview-bar">
          <div className="gy-preview-bar-left">
            <div className="gy-preview-dots">
              <span style={{ background: '#ff5f57' }} />
              <span style={{ background: '#febc2e' }} />
              <span style={{ background: '#28c840' }} />
            </div>
            <span className="gy-preview-era">{era}</span>
          </div>
          <div className="gy-preview-url-bar">
            <span>{url.replace(/^\//, 'designwhich.works/')}</span>
          </div>
          <button ref={closeButtonRef} className="gy-preview-close" type="button" onClick={onClose} aria-label="Close preview">
            ESC
          </button>
        </div>
        <iframe
          src={url}
          className="gy-preview-iframe"
          title={`Preview of ${era}`}
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

export default function GraveyardPage() {
  const [previewVersion, setPreviewVersion] = useState<PortfolioVersion | null>(null);

  /* Mark body so CSS can remove nav overlay on this page */
  useEffect(() => {
    document.body.classList.add('page-graveyard');
    return () => document.body.classList.remove('page-graveyard');
  }, []);

  const handlePreview = useCallback((v: PortfolioVersion) => {
    setPreviewVersion(v);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewVersion(null);
  }, []);

  return (
    <>
      <Helmet>
        <title>Portfolio Graveyard, Parth Pawar</title>
        <meta name="description" content="Every portfolio I've ever built. A graveyard of past designs, from Webflow exports to React rewrites." />
      </Helmet>

      <Nav />
      <SvgFilters />

      <main id="main-content">
        <div className="gy-page">
          <GraveyardAtmosphere />

          {/* Hero */}
          <section className="gy-hero">
            <motion.span
              className="gy-hero-label"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              PORTFOLIO ARCHAEOLOGY
            </motion.span>
            <motion.h1
              className="gy-hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              The <em>Graveyard</em>
            </motion.h1>
            <motion.p
              className="gy-hero-subtitle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Every portfolio I've ever built. Some survived. Most didn't.
              Click any tombstone to dig up the remains.
            </motion.p>
          </section>

          {/* Tombstones */}
          <section className="gy-section">
            <div className="wrap">
              <motion.div
                className="gy-grid"
                variants={gridContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
              >
                {VERSIONS.map((v) => (
                  <GraveCard key={v.id} version={v} onPreview={handlePreview} />
                ))}
              </motion.div>
            </div>
          </section>

          {/* Epitaph */}
          <motion.section
            className="gy-epitaph"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="gy-epitaph-text">
              &ldquo;Here lie the designs that taught me everything I know.
              <br />Each one was the best I could do at the time.&rdquo;
            </p>
            <span className="gy-epitaph-sig">&mdash; The Designer, still digging</span>
          </motion.section>
        </div>
      </main>

      {previewVersion?.archiveUrl && (
        <IframePreview
          url={previewVersion.archiveUrl}
          era={previewVersion.era}
          onClose={handleClosePreview}
        />
      )}

      <Footer />
    </>
  );
}
