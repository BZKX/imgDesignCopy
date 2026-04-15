'use client';

import { useMemo, useState } from 'react';

type Card = {
  src: string;
  alt: string;
  title: string;
  author: string;
  avatar: string;
  likes: number;
  aspect: string;
};

const CARDS: Card[] = [
  { src: '/stage/style/01-cinematic-portrait-moody.webp', alt: 'Cinematic moody portrait at dusk', title: '✨ Harbor at dusk · 35mm', author: 'Ana', avatar: '#ff8aa8', likes: 1423, aspect: '3/4' },
  { src: '/stage/style/03-landscape-dusk-mountains.webp', alt: 'Minimalist mountain dusk landscape', title: '🏔 Mountain & Moon — solitude', author: 'Ken', avatar: '#7c5cff', likes: 892, aspect: '16/9' },
  { src: '/stage/style/06-still-life-coffee.webp', alt: 'Coffee pour-over flat lay', title: '🌿 Slow pour-over afternoon', author: 'Mei', avatar: '#ffb454', likes: 2048, aspect: '1/1' },
  { src: '/stage/style/09-street-neon-tokyo.webp', alt: 'Rain-slick Shinjuku alley with neon signs', title: '🌃 Shinjuku rain · neon', author: 'Ryu', avatar: '#00e1ff', likes: 3174, aspect: '9/16' },
  { src: '/stage/style/11-illustration-geometric.webp', alt: 'Minimalist geometric risograph print', title: '⬢ Bauhaus afternoon', author: 'Ivy', avatar: '#ff5c7c', likes: 712, aspect: '1/1' },
  { src: '/stage/style/04-landscape-foggy-coast.webp', alt: 'Long exposure foggy coastline at blue hour', title: '🌊 Lighthouse, blue hour', author: 'Noa', avatar: '#4d8eff', likes: 1561, aspect: '16/9' },
  { src: '/stage/style/02-cinematic-portrait-backlit.webp', alt: 'Backlit figure in misty neon alley', title: '🎞 Wong Kar-wai palette', author: 'Leo', avatar: '#ff6b9d', likes: 2389, aspect: '3/4' },
  { src: '/stage/style/07-still-life-books.webp', alt: 'Dark academia still life with leather books', title: '📚 Dark academia · walnut', author: 'Clara', avatar: '#c9b8ff', likes: 1087, aspect: '4/5' },
  { src: '/stage/style/10-street-y2k-mall.webp', alt: 'Empty Y2K shopping mall at 2am', title: '🛹 2 a.m. liminal mall', author: 'Jay', avatar: '#7ce0ff', likes: 4521, aspect: '9/16' },
  { src: '/stage/style/05-landscape-desert-cosmic.webp', alt: 'Salt flats under the milky way', title: '🌌 Salt flats · 30s exposure', author: 'Sol', avatar: '#2ee59d', likes: 1896, aspect: '16/9' },
  { src: '/stage/style/08-still-life-floral.webp', alt: 'Minimalist ikebana with pampas grass', title: '🕯 Wabi-sabi · negative space', author: 'Yumi', avatar: '#a1a1a8', likes: 634, aspect: '1/1' },
  { src: '/stage/style/12-illustration-surreal.webp', alt: 'Surreal gouache illustration of moon and stars', title: '🌙 Boy fishing for stars', author: 'Oliver', avatar: '#ffd88a', likes: 2712, aspect: '1/1' },
];

const ACCENT = '#ff6b9d';

export default function StyleStageClient() {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setLiked((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  const palette = useMemo(
    () => ({
      bg: '#07070a',
      card: '#0d0d12',
      border: 'rgba(255,255,255,0.06)',
      fg: '#f5f5f7',
      muted: '#a1a1a8',
    }),
    []
  );

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, color: palette.fg, paddingTop: 24, paddingBottom: 80 }}>
      <header style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #ff9ec7)` }} />
            <span style={{ fontWeight: 600, fontSize: 17 }}>Moodboard · Daily picks</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Discover', 'Following', 'Nearby'].map((tab, i) => (
              <span
                key={tab}
                style={{
                  fontSize: 14,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: i === 0 ? ACCENT : 'transparent',
                  color: i === 0 ? '#111' : palette.muted,
                  fontWeight: 500,
                }}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px',
          columnCount: 3,
          columnGap: 16,
        }}
      >
        {CARDS.map((c, i) => (
          <article
            key={c.src}
            style={{
              breakInside: 'avoid',
              marginBottom: 16,
              background: palette.card,
              border: `1px solid ${palette.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'relative', aspectRatio: c.aspect, background: '#000' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={c.alt}
                loading={i < 4 ? 'eager' : 'lazy'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ padding: '10px 12px 12px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4, marginBottom: 10, color: palette.fg }}>{c.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      background: c.avatar,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 10,
                      color: '#111',
                      fontWeight: 600,
                    }}
                  >
                    {c.author[0]}
                  </div>
                  <span style={{ fontSize: 12, color: palette.muted }}>{c.author}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-label={liked.has(i) ? `Unlike ${c.title}` : `Like ${c.title}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: liked.has(i) ? ACCENT : palette.muted,
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 0,
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: 14 }}>
                    {liked.has(i) ? '♥' : '♡'}
                  </span>
                  {(c.likes + (liked.has(i) ? 1 : 0)).toLocaleString('en-US')}
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>

      <footer style={{ textAlign: 'center', marginTop: 48, color: palette.muted, fontSize: 12 }}>
        More scenes coming in v1.1
      </footer>

      <style jsx>{`
        @media (max-width: 1024px) {
          main {
            column-count: 2 !important;
          }
        }
        @media (max-width: 640px) {
          main {
            column-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
