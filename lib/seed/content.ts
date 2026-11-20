// Real content for the first deploy: today's hardcoded posts/links plus the November 2026 schedule
// (transcribed from the AJK's poster). Pure data: loaded by scripts/seed-content.ts, checked by tests/seed-content.test.ts.
// No imports on purpose, so Node can run it directly without a bundler.

export const PROGRAM_TYPE_NAMES = [
  'Kuliah Maghrib',
  'Kuliah Subuh',
  'Yassin / Tahlil / Doa Selamat',
  'Si Cilik Mengaji',
  'Kuliah Dhuha',
] as const;

export type SeedPost = {
  type: 'pengumuman' | 'buletin';
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  imageFile: string | null; // path under public/
  externalUrl: string | null;
  publishedAt: string;
  pinned: boolean;
};

const at = (date: string) => `${date}T12:00:00+08:00`;

export const SEED_POSTS: SeedPost[] = [
  {
    type: 'pengumuman', slug: 'kekosongan-jawatan-siak', title: 'Kekosongan Jawatan SIAK di SEV', subtitle: null,
    body: 'Surau Elmina Valley kini membuka peluang untuk mengisi kekosongan jawatan sebagai SIAK (Sistem Informasi & Aktiviti Keagamaan).',
    imageFile: 'images/aboutus/siak.jpg', externalUrl: null, publishedAt: at('2024-07-20'), pinned: false,
  },
  {
    type: 'pengumuman', slug: 'tabung-khairat', title: 'Tabung Khairat', subtitle: null,
    body: 'Dibuka kepada semua penduduk Muslimin & Muslimat yang telah menetap di kawasan Elmina sekurang-kurangnya TIGA (3) bulan dari tarikh berdaftar sebagai ahli.',
    imageFile: 'images/articles/article2.png', externalUrl: 'https://form.jotform.com/elminavalley/TabungKhairat', publishedAt: at('2024-07-02'), pinned: false,
  },
  {
    type: 'buletin', slug: 'kutipan-bulanan-tabung-sev', title: 'Kutipan Bulanan Tabung SEV', subtitle: 'Jumlah Kutipan Bulanan Tabung SEV',
    body: null, imageFile: 'images/articles/article6.jpg', externalUrl: '/tabung', publishedAt: at('2024-07-19'), pinned: false,
  },
  {
    type: 'buletin', slug: 'tabung-khairat-kematian', title: 'Tabung Khairat Kematian', subtitle: 'Pendaftaran Keahlian Kini Dibuka',
    body: null, imageFile: 'images/articles/article2.png', externalUrl: 'https://form.jotform.com/elminavalley/TabungKhairat', publishedAt: at('2024-07-02'), pinned: false,
  },
  {
    type: 'buletin', slug: 'tabung-derma-surau', title: 'Tabung Derma Surau', subtitle: 'Ayuh amal jariah dengan menderma',
    body: null, imageFile: 'images/articles/qr_square.png', externalUrl: null, publishedAt: at('2024-07-02'), pinned: false,
  },
  {
    type: 'buletin', slug: 'hari-raya-eidul-adha', title: 'Hari Raya Eidul-Adha', subtitle: 'Solat Sunat Eidul-Adha 2024 di SEV',
    body: 'Album gambar: lihat pautan.', imageFile: 'images/articles/article4.jpg',
    externalUrl: 'https://drive.google.com/drive/folders/1nJDqx4MWPdhjUOwjTpA40HcRA2XMRjOY?usp=drive_link', publishedAt: at('2024-06-17'), pinned: false,
  },
  {
    type: 'buletin', slug: 'program-qurban-sev-24', title: 'Program Qurban SEV 24', subtitle: '2 ekor Kambing & 5 Ekor Lembu!',
    body: 'Video program: lihat pautan.', imageFile: 'images/articles/article.jpg',
    externalUrl: 'https://www.youtube.com/watch?v=dPnTTTwGgJs', publishedAt: at('2024-06-17'), pinned: false,
  },
  {
    type: 'buletin', slug: 'perkongsian-hadith', title: 'Perkongsian Hadith', subtitle: 'Jom 5 minit 1 Hadith',
    body: null, imageFile: 'images/articles/feat3.jpeg', externalUrl: null, publishedAt: at('2024-07-02'), pinned: false,
  },
];

export const SEED_LINKS = [
  { title: 'Pendaftaran / Pembaharuan Keahlian Tabung Khairat Kematian', url: '/khairat', description: 'Borang pendaftaran ahli Tabung Khairat Kematian.', category: 'Borang' },
  { title: 'Kutipan Bulanan Tabung Surau Elmina Valley', url: '/tabung', description: 'Jumlah kutipan dan cara menderma.', category: 'Sumbangan' },
] as const;

export const SEED_SPEAKERS = [
  'Ustaz Prof Madya Dr Khader Ahmad',
  'Ustaz Mohd Ayub Wari',
  'Imam Farid',
  'Ustaz Haji Nazrin',
  'Ustaz Ahmad Salahuddin',
  'Imam Sobri',
  'Ustaz Dr Mohd Sobri Ellias',
  'Ustaz Nik Taufik',
  'Ustaz Suhail Sufian',
  'Ustaz Hadi Talhah',
  'Ustaz Dr Anzaruddin',
] as const;

export type SeedSession = {
  date: string; typeName: (typeof PROGRAM_TYPE_NAMES)[number]; topic: string | null; kitab: string | null; speaker: string | null;
};

const MAGHRIB = 'Kuliah Maghrib' as const;
const YASSIN = 'Yassin / Tahlil / Doa Selamat' as const;
const CILIK = 'Si Cilik Mengaji' as const;

/** November 2026, from the AJK's poster. Kitab is only filled where the poster text is legible; the AJK complete the rest. */
export function novemberSessions(): SeedSession[] {
  const d = (n: number) => `2026-11-${String(n).padStart(2, '0')}`;
  return [
    { date: d(4), typeName: MAGHRIB, topic: 'Mastika Hadith', kitab: null, speaker: 'Ustaz Prof Madya Dr Khader Ahmad' },
    { date: d(5), typeName: MAGHRIB, topic: 'Tafsir/Tadabur', kitab: null, speaker: 'Ustaz Mohd Ayub Wari' },
    { date: d(6), typeName: CILIK, topic: null, kitab: null, speaker: 'Imam Farid' },
    { date: d(8), typeName: MAGHRIB, topic: 'Hadith Akhir Zaman', kitab: null, speaker: 'Ustaz Haji Nazrin' },
    { date: d(9), typeName: MAGHRIB, topic: 'Umum', kitab: null, speaker: 'Ustaz Ahmad Salahuddin' },
    { date: d(10), typeName: MAGHRIB, topic: 'Bahasa Arab', kitab: null, speaker: 'Imam Sobri' },
    { date: d(11), typeName: MAGHRIB, topic: 'Akidah', kitab: 'Sullamut Taufiq', speaker: 'Ustaz Dr Mohd Sobri Ellias' },
    { date: d(12), typeName: YASSIN, topic: null, kitab: null, speaker: null },
    { date: d(13), typeName: CILIK, topic: null, kitab: null, speaker: 'Imam Farid' },
    { date: d(18), typeName: MAGHRIB, topic: 'Fiqah', kitab: 'Bulughul Maram', speaker: 'Ustaz Suhail Sufian' },
    { date: d(19), typeName: YASSIN, topic: null, kitab: null, speaker: null },
    { date: d(20), typeName: MAGHRIB, topic: 'Al-Quran', kitab: null, speaker: 'Ustaz Nik Taufik' },
    { date: d(20), typeName: CILIK, topic: null, kitab: null, speaker: 'Imam Farid' },
    { date: d(22), typeName: MAGHRIB, topic: 'Hadith', kitab: null, speaker: 'Ustaz Hadi Talhah' },
    { date: d(24), typeName: MAGHRIB, topic: 'Tasawuf', kitab: null, speaker: 'Imam Sobri' },
    { date: d(26), typeName: YASSIN, topic: null, kitab: null, speaker: null },
    { date: d(27), typeName: CILIK, topic: null, kitab: null, speaker: 'Imam Farid' },
    { date: d(29), typeName: MAGHRIB, topic: 'Sirah Nabawi', kitab: null, speaker: 'Ustaz Dr Anzaruddin' },
  ];
}

/** Storage extension for a source image. The admin form only accepts .webp/.jpg/.png paths, so .jpeg becomes .jpg. */
export function uploadExt(file: string): 'jpg' | 'png' | 'webp' {
  const ext = file.toLowerCase().split('.').pop();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png') return 'png';
  if (ext === 'webp') return 'webp';
  throw new Error(`Unsupported image type: ${file}`);
}
