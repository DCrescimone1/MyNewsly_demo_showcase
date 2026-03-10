// MODULE B — Logo Grid
// Props:
//   phase         — 'idle' | 'active' | 'sending' | 'done'
//   activeSources — array of source IDs currently in 'sending' flash

import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

// ─── Dashboard bounds (must match Dashboard.jsx) ───────────────────────────
// left:380  right:900  top:173  contentTop:209  bottom:547  w:520  contentH:338

// ─── Source definitions ────────────────────────────────────────────────────
// Order = stagger order (left col top→bottom, top row, right col top→bottom, bottom row)
const SOURCES = [
  // Left column (x=20, right edge at x=110)
  { id: 'guardian',   label: 'The Guardian',    src: '/logos/the-guardian-new-2018.svg',      x: 20,   y: 80  },
  { id: 'reuters',    label: 'Reuters',         src: '/logos/reuters-6.svg',                  x: 20,   y: 215 },
  { id: 'wired',      label: 'Wired',           src: '/logos/wired.svg',                      x: 20,   y: 350 },
  { id: 'forbes',     label: 'Forbes',          src: '/logos/forbes-2.svg',                   x: 20,   y: 480 },
  // Top row (y=20, bottom edge at y=80)
  { id: 'bbc',        label: 'BBC',             src: '/logos/bbc-2.svg',                      x: 195,  y: 20,  logoSize: { w: 98, h: 70 } },
  { id: 'cnn',        label: 'CNN',              src: '/logos/cnn-3.svg',                      x: 395,  y: 20  },
  { id: 'techcrunch', label: 'TechCrunch',      src: '/logos/techchrunch.svg',                x: 545,  y: 20  },
  { id: 'vogue',      label: 'Vogue',           src: '/logos/vogue.svg',                      x: 695,  y: 20  },
  { id: 'natgeo',     label: 'Nat Geo',         src: '/logos/national-geographic-channel.svg',x: 895,  y: 20  },
  // Right column (x=1170, left edge at x=1170)
  { id: 'economist',  label: 'The Economist',   src: '/logos/the economist_logo.svg',         x: 1170, y: 80  },
  { id: 'nyt',        label: 'NYT',             src: '/logos/the-new-york-times.svg',         x: 1170, y: 215, logoSize: { w: 118, h: 88 } },
  { id: 'adobepdf',   label: 'Adobe PDF',       src: '/logos/adobe-pdf-icon.svg',             x: 1170, y: 350 },
  { id: 'wsj',        label: 'WSJ',             src: '/logos/the-wall-street-journal-1.svg',  x: 1170, y: 480, logoSize: { w: 86, h: 56 } },
]

// ─── Sparkle ──────────────────────────────────────────────────────────────
function Sparkle({ onDone }) {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, y: 0 }}
      animate={{ opacity: 0, scale: 0, y: -20 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      onAnimationComplete={onDone}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 8, height: 8, borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #9B30FF 60%, transparent 100%)',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none', zIndex: 10,
      }}
    />
  )
}

// ─── Single card ──────────────────────────────────────────────────────────
function LogoCard({ source, index, phase, isSending }) {
  const [sparkle, setSparkle] = useState(false)
  useEffect(() => { if (isSending) setSparkle(true) }, [isSending])

  const animate = isSending
    ? { scale: [1, 1.15, 1], filter: 'brightness(2)', opacity: 1 }
    : phase === 'active'
      ? { scale: [1, 1.03, 1], opacity: 1, filter: 'brightness(1)' }
      : phase === 'done'
        ? { scale: 1, opacity: 0.75, filter: 'brightness(1)' }
        : { scale: 1, opacity: 1, filter: 'brightness(1)' }

  const transition = isSending
    ? { scale: { duration: 0.3 }, filter: { duration: 0.15 } }
    : phase === 'active'
      ? { scale: { repeat: Infinity, duration: 2, ease: 'easeInOut', delay: (index % 7) * 0.15 }, opacity: { duration: 0.3 } }
      : { type: 'spring', stiffness: 200, damping: 20, delay: index * 0.07 }

  const shadow = (phase === 'active' || phase === 'done')
    ? '0 2px 12px rgba(155,48,255,0.15), 0 1px 4px rgba(0,0,0,0.15)'
    : '0 2px 8px rgba(0,0,0,0.2)'

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={animate}
      transition={transition}
      style={{
        position: 'absolute',
        left: source.x, top: source.y,
        width: 90, height: 60,
        willChange: 'transform',
      }}
    >
      <div style={{
        width: '100%', height: '100%',
        background: '#fff', borderRadius: 12,
        boxShadow: shadow,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {source.badge ? (
          <span style={{
            background: source.badge.bg,
            color: source.badge.color,
            fontWeight: source.badge.fw,
            border: source.badge.border || 'none',
            borderRadius: 6, padding: '3px 7px',
            fontSize: 10, fontFamily: 'system-ui, sans-serif',
            whiteSpace: 'nowrap', maxWidth: 80, textAlign: 'center', lineHeight: 1.3,
          }}>{source.label}</span>
        ) : (
          <img src={source.src} alt={source.label}
            style={{ maxWidth: source.logoSize?.w ?? 64, maxHeight: source.logoSize?.h ?? 40, objectFit: 'contain', display: 'block' }} />
        )}
        {sparkle && <Sparkle onDone={() => setSparkle(false)} />}
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────
export default function LogoGrid({ phase = 'idle', activeSources = [] }) {
  return (
    <div style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
      {SOURCES.map((source, i) => (
        <LogoCard
          key={source.id}
          source={source}
          index={i}
          phase={phase}
          isSending={activeSources.includes(source.id)}
        />
      ))}
    </div>
  )
}
