// MODULE G — Agent Dashboard
// Browser chrome + 3 live RSS ticker rows (Guardian / CNN / Reuters).
// Positioned: left=690, top=145, width=560.
//
// Row layout (content starts at top=181 after chrome):
//   padding 12px → first row at y=193, height=106, gap=10
//   row 0 center canvas-y ≈ 246
//   row 1 center canvas-y ≈ 362
//   row 2 center canvas-y ≈ 478
//
// RSS is fetched via corsproxy.io. On failure, fallback headlines are shown.
// Props:
//   visible   — boolean: rows animate in when true
//   scrolling — boolean: tickers start scrolling when true

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

// ─── Ticker animation injected once ────────────────────────────────────────
const TICKER_KEYFRAMES = `
@keyframes agentTicker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
`

// ─── Sources ───────────────────────────────────────────────────────────────
const RSS_SOURCES = [
  {
    id: 'guardian',
    label: 'GUARDIAN',
    color: '#005689',
    url: 'https://www.theguardian.com/world/rss',
    tickerDuration: 55,
    fallback: [
      'World leaders convene for emergency climate summit in Geneva',
      'Tech giants face sweeping new regulation across EU member states',
      'Scientists announce major breakthrough in quantum computing',
      'Global inflation shows signs of easing says central bank report',
      'New diplomatic talks open between rival nations after months of tension',
    ],
  },
  {
    id: 'cnn',
    label: 'CNN',
    color: '#CC0000',
    url: 'https://rss.cnn.com/rss/edition.rss',
    tickerDuration: 35,
    fallback: [
      'Breaking: Major policy shift announced by White House officials',
      'Markets rally for third consecutive day on strong jobs data',
      'Exclusive report reveals inside details of international summit',
      'Health officials issue guidance on new respiratory illness variant',
      'Analysis: How the latest tech layoffs reshape Silicon Valley',
    ],
  },
  {
    id: 'reuters',
    label: 'REUTERS',
    color: '#E85A00',
    url: 'https://feeds.reuters.com/reuters/topNews',
    tickerDuration: 35,
    fallback: [
      'Oil prices climb as OPEC signals further production cuts',
      'IMF revises global growth forecast upward for second quarter',
      'Central banks signal coordinated shift in monetary policy stance',
      'Semiconductor shortage eases as new fabs come online in Asia',
      'Record foreign investment flows into emerging market bonds',
    ],
  },
]

// ─── RSS fetch ──────────────────────────────────────────────────────────────
const PROXY = 'https://corsproxy.io/?'

async function fetchHeadlines(url) {
  try {
    const res = await fetch(PROXY + encodeURIComponent(url), {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const text = await res.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'text/xml')
    const items = Array.from(xml.querySelectorAll('item title'))
    const headlines = items
      .map(el => el.textContent.replace(/<!\[CDATA\[|\]\]>/g, '').trim())
      .filter(h => h && h.length > 10)
      .slice(0, 8)
    return headlines.length >= 2 ? headlines : null
  } catch {
    return null
  }
}

// ─── Ticker ─────────────────────────────────────────────────────────────────
// Two identical spans side by side; CSS animation translates -50% (= one span width)
// for a perfectly seamless loop regardless of text length.
function Ticker({ headlines, scrolling, duration }) {
  const text = headlines.join('   ·   ') + '   ·   '

  return (
    <div style={{
      overflow: 'hidden',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      height: '100%',
    }}>
      {scrolling ? (
        <div
          style={{
            animation: `agentTicker ${duration}s linear infinite`,
            display: 'inline-flex',
            whiteSpace: 'nowrap',
            fontSize: 11,
            color: '#C8C8D8',
            fontFamily: 'system-ui, sans-serif',
            paddingLeft: 12,
            willChange: 'transform',
          }}
        >
          <span>{text}</span>
          <span>{text}</span>
        </div>
      ) : (
        <span style={{
          whiteSpace: 'nowrap',
          fontSize: 11,
          color: '#3A3A5A',
          fontFamily: 'system-ui, sans-serif',
          paddingLeft: 12,
          overflow: 'hidden',
        }}>
          {headlines[0] || 'Connecting…'}
        </span>
      )}
    </div>
  )
}

// ─── Single RSS row ─────────────────────────────────────────────────────────
function RSSRow({ source, visible, scrolling, delay }) {
  const [headlines, setHeadlines] = useState(source.fallback)

  useEffect(() => {
    fetchHeadlines(source.url).then(result => {
      if (result) setHeadlines(result)
    })
  }, [source.url])

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 24 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: 106,
        borderRadius: 8,
        border: '1px solid #1E1E2E',
        overflow: 'hidden',
        background: '#0D0D1A',
      }}
    >
      {/* Source badge */}
      <div style={{
        width: 68,
        flexShrink: 0,
        background: source.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6px',
      }}>
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.06em',
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {source.label}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: '100%', background: '#1E1E2E', flexShrink: 0 }} />

      {/* Ticker */}
      <Ticker
        headlines={headlines}
        scrolling={scrolling}
        duration={source.tickerDuration}
      />
    </motion.div>
  )
}

// ─── Traffic lights ─────────────────────────────────────────────────────────
function TrafficLights() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {['#FF5F57', '#FFBD2E', '#28C840'].map(c => (
        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
      ))}
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function AgentDashboard({ visible = false, scrolling = false }) {
  return (
    <>
      <style>{TICKER_KEYFRAMES}</style>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        style={{
          position: 'absolute',
          left: 690,
          top: 145,
          width: 560,
          willChange: 'transform',
        }}
      >
        <div style={{
          borderRadius: 14,
          border: '1px solid #1E1E2E',
          boxShadow: '0 24px 70px rgba(155,48,255,0.2), 0 6px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          background: '#12121A',
        }}>
          {/* Browser chrome */}
          <div style={{
            height: 36,
            background: '#1A1A2E',
            borderBottom: '1px solid #2A2A3E',
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
            flexShrink: 0,
          }}>
            <TrafficLights />
            <div style={{
              flex: 1, height: 20, background: '#0D0D1A',
              borderRadius: 4, border: '1px solid #2A2A3E',
              display: 'flex', alignItems: 'center', paddingLeft: 8,
            }}>
              <span style={{ fontSize: 10, color: '#4A4A6A', fontFamily: 'system-ui, sans-serif' }}>
                www.mynewsly.com
              </span>
            </div>
          </div>

          {/* RSS rows */}
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RSS_SOURCES.map((source, i) => (
              <RSSRow
                key={source.id}
                source={source}
                visible={visible}
                scrolling={scrolling}
                delay={i * 0.15}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}
