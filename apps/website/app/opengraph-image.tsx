import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PromptLens — Screenshot to AI Prompt'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient mesh background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.25) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59,130,246,0.2) 0%, transparent 60%)',
        }}
      />
      {/* Grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Logo mark */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}
        >
          🔍
        </div>
        <span style={{ color: '#ffffff', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          PromptLens
        </span>
      </div>
      {/* Headline */}
      <div
        style={{
          color: '#ffffff',
          fontSize: '56px',
          fontWeight: 800,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          textAlign: 'center',
          maxWidth: '900px',
          zIndex: 1,
        }}
      >
        Screenshot to AI Prompt
      </div>
      {/* Sub */}
      <div
        style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '26px',
          marginTop: '20px',
          textAlign: 'center',
          maxWidth: '700px',
          zIndex: 1,
        }}
      >
        Turn any image into a precise drawing prompt — in seconds.
      </div>
    </div>,
    { ...size },
  )
}
