'use client';

import { useCallback, useRef, useState } from 'react';
import { preprocessImage, FileTooLargeError, type ProcessedImage } from './imagePreprocess';

interface Props {
  onImage: (img: ProcessedImage) => void;
  onError: (msg: string) => void;
  disabled?: boolean;
  currentImage: ProcessedImage | null;
}

const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export default function ImageDropzone({ onImage, onError, disabled, currentImage }: Props) {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    async (file: File) => {
      if (!ACCEPTED_MIME.includes(file.type)) {
        onError('Unsupported file type. Use PNG, JPEG, WebP, or GIF.');
        return;
      }
      setProcessing(true);
      try {
        const img = await preprocessImage(file);
        onImage(img);
      } catch (err) {
        if (err instanceof FileTooLargeError) {
          onError(err.message);
        } else {
          onError('Failed to process image.');
        }
      } finally {
        setProcessing(false);
      }
    },
    [onImage, onError],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handle(file);
    },
    [handle, disabled],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      const item = Array.from(e.clipboardData.items).find((i) => i.kind === 'file');
      if (item) {
        const file = item.getAsFile();
        if (file) handle(file);
      }
    },
    [handle, disabled],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handle(file);
      e.target.value = '';
    },
    [handle],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Image drop zone — paste or drop an image"
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onPaste={onPaste}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      style={{
        position: 'relative',
        borderRadius: 'var(--pl-radius-lg)',
        border: `1.5px dashed ${dragging ? 'var(--color-pl-accent-from)' : 'var(--color-pl-border-default)'}`,
        background: dragging
          ? 'rgba(124,92,255,0.06)'
          : currentImage
          ? 'var(--color-pl-bg-elev-1)'
          : 'var(--color-pl-bg-elev-2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 20,
        transition: 'border-color 0.2s, background 0.2s',
        outline: 'none',
        animation: dragging ? 'pl-pulse 0.5s ease-in-out infinite alternate' : 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME.join(',')}
        style={{ display: 'none' }}
        onChange={onFileChange}
        disabled={disabled}
      />

      {processing ? (
        <div style={{ color: 'var(--color-pl-fg-secondary)', fontSize: '0.875rem' }}>
          Processing…
        </div>
      ) : currentImage ? (
        <>
          {/* Thumbnail preview */}
          <div
            style={{
              width: '100%',
              maxHeight: 120,
              overflow: 'hidden',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={`data:${currentImage.mime};base64,${currentImage.base64}`}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'contain' }}
            />
          </div>
          <div style={{ color: 'var(--color-pl-fg-tertiary)', fontSize: '0.8125rem', textAlign: 'center' }}>
            {currentImage.width}×{currentImage.height} · {(currentImage.byteSize / 1024).toFixed(0)} KB
            <br />
            <span style={{ color: 'var(--color-pl-fg-disabled)' }}>Click or paste to replace</span>
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--color-pl-bg-elev-1)',
              border: '1px solid var(--color-pl-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            ↑
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--color-pl-fg-primary)', fontWeight: 500, fontSize: '0.9375rem' }}>
              Drop image or paste
            </div>
            <div style={{ color: 'var(--color-pl-fg-tertiary)', fontSize: '0.8125rem', marginTop: 4 }}>
              Cmd+V · PNG / JPEG / WebP · max 4 MB
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes pl-pulse {
          from { background: rgba(124,92,255,0.04); }
          to   { background: rgba(124,92,255,0.10); }
        }
      `}</style>
    </div>
  );
}
