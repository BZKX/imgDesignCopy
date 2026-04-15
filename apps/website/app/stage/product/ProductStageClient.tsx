'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

type ProductKey = 'audio' | 'chair' | 'skincare';

type Product = {
  breadcrumb: string[];
  title: string;
  tagline: string;
  rating: number;
  reviews: number;
  price: number;
  colors: { name: string; swatch: string }[];
  bullets: string[];
  hero: string;
  related: { key: ProductKey; title: string; price: number; src: string }[];
  theme: { bg: string; card: string; accent: string; fg: string; muted: string };
};

const PRODUCTS: Record<ProductKey, Product> = {
  audio: {
    breadcrumb: ['Home', 'Audio', 'Headphones'],
    title: 'Aura Pro Wireless',
    tagline: 'Hi-res audio. 40-hour battery. Cloud-soft earcups.',
    rating: 4.8,
    reviews: 248,
    price: 299,
    colors: [
      { name: 'Midnight', swatch: '#18181b' },
      { name: 'Titanium', swatch: '#9ca3af' },
      { name: 'Sand', swatch: '#d6cfbf' },
    ],
    bullets: ['40h battery life', 'Active noise cancelling', 'Hi-res LDAC codec', '3-device multipoint'],
    hero: '/stage/product/audio.webp',
    related: [
      { key: 'chair', title: 'Nordic Lounge Chair', price: 580, src: '/stage/product/chair.webp' },
      { key: 'skincare', title: 'Luna Serum', price: 85, src: '/stage/product/skincare.webp' },
      { key: 'audio', title: 'Aura Pro Wireless', price: 299, src: '/stage/product/audio.webp' },
    ],
    theme: { bg: '#07070a', card: '#0d0d12', accent: '#f5f5f7', fg: '#f5f5f7', muted: '#a1a1a8' },
  },
  chair: {
    breadcrumb: ['Home', 'Furniture', 'Lounge'],
    title: 'Nordic Lounge Chair',
    tagline: 'Oak frame. Cognac leather. Heirloom craft.',
    rating: 4.9,
    reviews: 112,
    price: 580,
    colors: [
      { name: 'Cognac', swatch: '#8b4513' },
      { name: 'Onyx', swatch: '#1f1f1f' },
      { name: 'Fog', swatch: '#c9c1b6' },
    ],
    bullets: ['FSC-certified oak', 'Full-grain Italian leather', 'Hand-stitched seams', 'Lifetime frame warranty'],
    hero: '/stage/product/chair.webp',
    related: [
      { key: 'audio', title: 'Aura Pro Wireless', price: 299, src: '/stage/product/audio.webp' },
      { key: 'skincare', title: 'Luna Serum', price: 85, src: '/stage/product/skincare.webp' },
      { key: 'chair', title: 'Nordic Lounge Chair', price: 580, src: '/stage/product/chair.webp' },
    ],
    theme: { bg: '#18120c', card: '#251c12', accent: '#d9a66c', fg: '#f5efe4', muted: '#a89a85' },
  },
  skincare: {
    breadcrumb: ['Home', 'Beauty', 'Serums'],
    title: 'Luna Restorative Serum',
    tagline: 'Gold-peptide complex. Night-phase recovery.',
    rating: 4.7,
    reviews: 1842,
    price: 85,
    colors: [
      { name: '30ml', swatch: '#111' },
      { name: '50ml', swatch: '#333' },
      { name: '100ml', swatch: '#555' },
    ],
    bullets: ['24k gold-peptide complex', 'Fragrance-free', 'Dermatologist tested', 'Recycled glass bottle'],
    hero: '/stage/product/skincare.webp',
    related: [
      { key: 'audio', title: 'Aura Pro Wireless', price: 299, src: '/stage/product/audio.webp' },
      { key: 'chair', title: 'Nordic Lounge Chair', price: 580, src: '/stage/product/chair.webp' },
      { key: 'skincare', title: 'Luna Serum', price: 85, src: '/stage/product/skincare.webp' },
    ],
    theme: { bg: '#0a0804', card: '#17120a', accent: '#c9a96a', fg: '#f2e9d5', muted: '#8a7d60' },
  },
};

export default function ProductStageClient() {
  const params = useSearchParams();
  const keyParam = params.get('p');
  const key: ProductKey = keyParam === 'chair' || keyParam === 'skincare' ? keyParam : 'audio';
  const p = PRODUCTS[key];
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);

  return (
    <div style={{ minHeight: '100vh', background: p.theme.bg, color: p.theme.fg, paddingBottom: 96 }}>
      <header style={{ borderBottom: `1px solid ${p.theme.card}`, padding: '16px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, letterSpacing: 0.3 }}>ATELIER</span>
          <nav style={{ display: 'flex', gap: 24, fontSize: 14, color: p.theme.muted }}>
            <span>Shop</span>
            <span>Story</span>
            <span>Journal</span>
            <span>Account</span>
            <span style={{ color: p.theme.fg }}>🛒 0</span>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 0', fontSize: 12, color: p.theme.muted }}>
        {p.breadcrumb.join(' / ')}
      </div>

      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '24px 32px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 48,
        }}
      >
        <div>
          <div style={{ position: 'relative', aspectRatio: '1/1', background: p.theme.card, borderRadius: 20, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.hero} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1/1',
                  background: p.theme.card,
                  borderRadius: 8,
                  border: i === 0 ? `2px solid ${p.theme.accent}` : '2px solid transparent',
                  overflow: 'hidden',
                  opacity: i === 0 ? 1 : 0.5,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.hero} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 8, letterSpacing: -0.5 }}>{p.title}</h1>
          <p style={{ fontSize: 16, color: p.theme.muted, marginBottom: 16 }}>{p.tagline}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span style={{ color: p.theme.accent, letterSpacing: 2 }}>★★★★★</span>
            <span style={{ fontSize: 13, color: p.theme.muted }}>
              {p.rating} · {p.reviews.toLocaleString()} reviews
            </span>
          </div>

          <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 32 }}>${p.price.toFixed(2)}</div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: p.theme.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              {p.colors[selectedColor].name}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {p.colors.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(i)}
                  aria-label={c.name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    background: c.swatch,
                    border: i === selectedColor ? `2px solid ${p.theme.accent}` : `1px solid ${p.theme.card}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: p.theme.card, borderRadius: 8, padding: '8px 6px' }}>
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{ background: 'transparent', border: 'none', color: p.theme.fg, padding: '0 12px', fontSize: 18, cursor: 'pointer' }}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span style={{ minWidth: 28, textAlign: 'center', fontSize: 15 }}>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                style={{ background: 'transparent', border: 'none', color: p.theme.fg, padding: '0 12px', fontSize: 18, cursor: 'pointer' }}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              style={{
                flex: 1,
                background: p.theme.accent,
                color: '#111',
                border: 'none',
                borderRadius: 8,
                padding: '14px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 0.5,
              }}
            >
              Add to Cart
            </button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {p.bullets.map((b) => (
              <li key={b} style={{ fontSize: 14, color: p.theme.muted, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: p.theme.accent }}>✓</span> {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: '64px auto 0', padding: '0 32px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>You may also like</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {p.related.map((r) => (
            <a
              key={r.key + r.title}
              href={`/stage/product?p=${r.key}`}
              style={{
                background: p.theme.card,
                borderRadius: 12,
                overflow: 'hidden',
                textDecoration: 'none',
                color: p.theme.fg,
                display: 'block',
              }}
            >
              <div style={{ aspectRatio: '1/1' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.src} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 13, color: p.theme.muted }}>${r.price}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer style={{ textAlign: 'center', marginTop: 64, color: p.theme.muted, fontSize: 12 }}>
        More scenes coming in v1.1
      </footer>
    </div>
  );
}
