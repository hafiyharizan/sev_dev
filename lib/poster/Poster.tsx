/* eslint-disable @next/next/no-img-element */
// Rendered by next/og (Satori): flexbox only, inline styles, every multi-child element needs display:flex.
import type { PosterCell, PosterModel } from './model';
import { DONATION, QR_CROP } from './donation';

export const POSTER_SIZE = { width: 2160, height: 1368 } as const;
const DAYS = ['ISNIN', 'SELASA', 'RABU', 'KHAMIS', 'JUMAAT', 'SABTU', 'AHAD'];

const PAD = 28;
const GAP = 12;
const LEFT_W = 520;
const HEADER_H = 56;
const GRID_W = POSTER_SIZE.width - PAD * 3 - LEFT_W;
const COL_W = Math.floor((GRID_W - GAP * 6) / 7);

function Cell({ cell, height }: { cell: PosterCell; height: number }) {
  const box = { display: 'flex', width: COL_W, height, flexShrink: 0, boxSizing: 'border-box' } as const;
  if (cell.date === null) return <div style={box} />;
  return (
    <div style={{ ...box, flexDirection: 'column', background: '#ffffff', borderRadius: 22, padding: 8, gap: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#111111', lineHeight: 1 }}>{cell.day}</div>
      {cell.blocks.map((b, i) => (
        <div key={i} style={{ display: 'flex', flex: 1, background: b.colour, borderRadius: 14, padding: 8, gap: 6, opacity: b.cancelled ? 0.45 : 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 20, fontWeight: 700, color: '#111111', textTransform: 'uppercase', lineHeight: 1.1, textDecoration: b.cancelled ? 'line-through' : 'none' }}>{b.topic}</div>
              {b.kitab ? <div style={{ display: 'flex', fontSize: 15, color: '#222222', marginTop: 2 }}>{b.kitab}</div> : null}
            </div>
            {b.speakerName ? <div style={{ display: 'flex', fontSize: 15, fontWeight: 700, color: '#111111' }}>{b.speakerName}</div> : null}
          </div>
          {b.photoUrl ? (
            <img src={b.photoUrl} width={64} height={64} style={{ width: 64, height: 64, borderRadius: 32, objectFit: 'cover', alignSelf: 'flex-end' }} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** QR is cropped out of the existing donation poster image: a clipped box with the full image offset inside it. */
function CroppedQr({ src, size }: { src: string; size: number }) {
  const s = size / QR_CROP.size;
  return (
    <div style={{ display: 'flex', width: size, height: size, overflow: 'hidden', borderRadius: 12, flexShrink: 0 }}>
      <img src={src} width={QR_CROP.imageWidth * s} height={QR_CROP.imageHeight * s}
        style={{ flexShrink: 0, marginLeft: -QR_CROP.x * s, marginTop: -QR_CROP.y * s, width: QR_CROP.imageWidth * s, height: QR_CROP.imageHeight * s }} />
    </div>
  );
}

export function Poster({ model, logoSrc, qrSrc }: { model: PosterModel; logoSrc: string; qrSrc: string }) {
  const [monthName, year] = model.title.split(' ');
  const rowH = Math.floor((POSTER_SIZE.height - PAD * 2 - HEADER_H - GAP * model.weeks.length) / model.weeks.length);
  return (
    <div style={{ display: 'flex', width: POSTER_SIZE.width, height: POSTER_SIZE.height, padding: PAD, gap: PAD, fontFamily: 'Inter',
      background: 'linear-gradient(180deg, #14104d 0%, #1b1fa6 100%)', color: '#ffffff' }}>
      {/* left panel */}
      <div style={{ display: 'flex', flexDirection: 'column', width: LEFT_W, gap: 22 }}>
        <div style={{ display: 'flex', alignSelf: 'flex-start', background: '#ffffff', borderRadius: 20, padding: 8 }}>
          <img src={logoSrc} width={210} height={118} style={{ width: 210, height: 118, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.95 }}>
            <div style={{ display: 'flex', fontSize: 84, fontWeight: 700 }}>{monthName}</div>
            <div style={{ display: 'flex', fontSize: 52, fontWeight: 700, color: '#9fb4ff' }}>{year}</div>
          </div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, lineHeight: 1.05, textTransform: 'uppercase' }}>Jadual Kuliah & Program Imarah</div>
        </div>
        <div style={{ display: 'flex', gap: 16, background: '#ffffff', borderRadius: 24, padding: 16, color: '#14104d' }}>
          <CroppedQr src={qrSrc} size={200} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
            <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, lineHeight: 1.05 }}>{DONATION.heading}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 20, fontWeight: 700 }}>{DONATION.bank}</div>
              <div style={{ display: 'flex', fontSize: 25, fontWeight: 700 }}>{DONATION.account}</div>
              <div style={{ display: 'flex', fontSize: 16 }}>{DONATION.accountName}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.35)', borderRadius: 24, padding: 22, gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>Jenis Program</div>
          {model.legend.map((l) => (
            <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22 }}>
              <div style={{ display: 'flex', width: 28, height: 28, borderRadius: 8, background: l.colour }} />
              <div style={{ display: 'flex', flex: 1 }}>{l.name}</div>
            </div>
          ))}
        </div>
      </div>
      {/* month grid */}
      <div style={{ display: 'flex', flexDirection: 'column', width: GRID_W, gap: GAP }}>
        <div style={{ display: 'flex', gap: GAP }}>
          {DAYS.map((d) => (
            <div key={d} style={{ display: 'flex', width: COL_W, justifyContent: 'center', alignItems: 'center', height: HEADER_H, background: 'rgba(0,0,0,0.45)', borderRadius: 16, fontSize: 26, fontWeight: 700 }}>{d}</div>
          ))}
        </div>
        {model.weeks.map((week, w) => (
          <div key={w} style={{ display: 'flex', gap: GAP }}>
            {week.map((cell, c) => <Cell key={c} cell={cell} height={rowH} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
