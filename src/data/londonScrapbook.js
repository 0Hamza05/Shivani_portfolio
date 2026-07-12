// ─────────────────────────────────────────────────────────────────────────
// Life in London — digital scrapbook / travel journal board.
//
// Every object on the board (photo, sticky note, ticket, passport stamp,
// boarding pass, postcard, receipt, map, or sticker) is described here, so
// the whole spread can be rearranged / added to / re-captioned without
// touching <LondonScrapbook />'s layout or interaction code.
//
// Shared fields
//   id            unique key
//   kind          'photo' | 'note' | 'ticket' | 'passport' | 'boardingPass'
//                 | 'postcard' | 'receipt' | 'map' | 'sticker'
//   pos           { x, y }  desktop position, % of the board area (top-left)
//   posMobile     { x, y }  optional mobile position, % of the taller board
//   rotate        resting tilt in degrees
//   attach        'pushpin' | 'washi' | 'tape' | 'clip' | 'cornerMounts' | null
//   attachColor   accent for the pin / tape
//   entrance      'slide-left' | 'fall' | 'rotate-in' | 'fade' | 'drop-bounce'
//
// Photo fields
//   style         'polaroid' | 'print' | 'instant' | 'strip' | 'square'
//   image         cover image
//   width         rendered width in px (desktop)
//   caption       small strip caption (polaroid / instant)
//   popup         { title, date, location, story[], gallery[] }
// ─────────────────────────────────────────────────────────────────────────

const IMG = '/images/life-in-london/optimised';
const FULL = '/images/life-in-london';
const STICKER_DIR = '/London Stickers';

export const NOTE_COLORS = {
  yellow: { bg: 'oklch(93% 0.08 95)',  edge: 'oklch(86% 0.09 95)' },
  blue:   { bg: 'oklch(91% 0.045 235)', edge: 'oklch(85% 0.05 235)' },
  cream:  { bg: 'oklch(95% 0.025 80)', edge: 'oklch(89% 0.03 80)' },
};

export const londonScrapbook = [
  // ── Photographs ───────────────────────────────────────────────────────
  {
    id: 'photo-1', kind: 'photo', style: 'polaroid',
    image: `${IMG}/life-in-london-op-2.webp`, width: 202, caption: 'first week',
    rotate: -6, pos: { x: 5, y: 6 }, posMobile: { x: 6, y: 3 },
    attach: 'pushpin', attachColor: '#c0392b', entrance: 'slide-left',
    popup: {
      title: 'The First Week', date: 'Autumn', location: 'Zone 1',
      story: [
        'Everything felt too fast and too grey and completely exhilarating all at once. I remember getting lost twice before finding the flat, and not minding at all.',
        'London does not introduce itself gently. It just expects you to keep up — and somehow, within days, I already was.',
      ],
      gallery: [`${FULL}/life-in-london-11.webp`, `${FULL}/life-in-london-12.webp`],
    },
  },
  {
    id: 'photo-2', kind: 'photo', style: 'print',
    image: `${IMG}/life-in-london-op-3.webp`, width: 220,
    rotate: 4, pos: { x: 26, y: 3 }, posMobile: { x: 55, y: 3 },
    attach: 'tape', attachColor: 'rgba(60,90,140,0.45)', entrance: 'fall',
    popup: {
      title: 'Sunday Walks', date: 'Winter', location: 'The riverside',
      story: [
        'A whole city that turns into a slow, deliberate ritual on Sundays — a walk with no destination, a coffee that takes an hour to finish.',
        'These were the days I fell in love with London\'s quieter side, the one the postcards never show.',
      ],
      gallery: [`${FULL}/life-in-london-13.webp`],
    },
  },
  {
    id: 'photo-3', kind: 'photo', style: 'instant',
    image: `${IMG}/life-in-london-op-4.webp`, width: 188, caption: 'friends, again',
    rotate: -8, pos: { x: 48, y: 6 }, posMobile: { x: 8, y: 20 },
    attach: 'pushpin', attachColor: '#1e3a5f', entrance: 'drop-bounce',
    popup: {
      title: 'Friends, Again', date: 'Spring', location: 'A flat in Zone 2',
      story: [
        'The people who turned a city into a home. Board games that ran too late, dinners that stretched into the next morning\'s plans.',
      ],
    },
  },
  {
    id: 'photo-4', kind: 'photo', style: 'square',
    image: `${IMG}/life-in-london-op-6.webp`, width: 178,
    rotate: 6, pos: { x: 68, y: 4 }, posMobile: { x: 52, y: 22 },
    attach: 'washi', attachColor: 'oklch(78% 0.09 25)', entrance: 'fade',
    popup: {
      title: 'City Lights', date: 'Autumn', location: 'South Bank',
      story: ['Some evenings the whole city seemed to be performing just for the walk home.'],
    },
  },
  {
    id: 'photo-5', kind: 'photo', style: 'strip',
    image: `${IMG}/life-in-london-op-7.webp`, width: 150,
    rotate: -3, pos: { x: 85, y: 18 }, posMobile: { x: 8, y: 40 },
    attach: 'clip', attachColor: '#8a8a92', entrance: 'rotate-in',
    popup: {
      title: 'A Good Night', date: 'Summer', location: 'Somewhere in Soho',
      story: ['Photo-booth strips are the closest thing to a time machine I own.'],
    },
  },
  {
    id: 'photo-6', kind: 'photo', style: 'print',
    image: `${IMG}/life-in-london-op-8.webp`, width: 214,
    rotate: 3, pos: { x: 6, y: 44 }, posMobile: { x: 42, y: 42 },
    attach: 'tape', attachColor: 'rgba(190,60,50,0.4)', entrance: 'slide-left',
    popup: {
      title: 'Museum Afternoons', date: 'Winter', location: 'Bloomsbury',
      story: [
        'Free museums are, quietly, one of the best things about this city. I went in to escape the rain and stayed for three hours.',
      ],
    },
  },
  {
    id: 'photo-7', kind: 'photo', style: 'polaroid',
    image: `${IMG}/life-in-london-op-9.webp`, width: 198, caption: 'home, sort of',
    rotate: 7, pos: { x: 30, y: 55 }, posMobile: { x: 6, y: 62 },
    attach: 'pushpin', attachColor: '#2f5233', entrance: 'fall',
    popup: {
      title: 'Home, Sort Of', date: 'Present day', location: 'My flat',
      story: [
        'It stopped being "the flat in London" and quietly became "home" somewhere along the way. I couldn\'t tell you the exact day it happened.',
      ],
    },
  },

  // ── Sticky notes ──────────────────────────────────────────────────────
  {
    id: 'note-1', kind: 'note', color: 'yellow',
    text: 'buy an umbrella that actually works', sub: 'note to self',
    rotate: -4, pos: { x: 20, y: 20 }, posMobile: { x: 60, y: 34 },
    attach: 'washi', attachColor: 'oklch(80% 0.08 90)', entrance: 'drop-bounce',
  },
  {
    id: 'note-2', kind: 'note', color: 'blue',
    text: 'the tube is somehow always both late and on time', sub: '',
    rotate: 5, pos: { x: 55, y: 42 }, posMobile: { x: 10, y: 80 },
    attach: 'pushpin', attachColor: '#3a5f8a', entrance: 'drop-bounce',
  },
  {
    id: 'note-3', kind: 'note', color: 'cream',
    text: 'two years in and still not over the skyline', sub: '♡',
    rotate: -6, pos: { x: 78, y: 55 }, posMobile: { x: 55, y: 88 },
    attach: 'tape', attachColor: 'rgba(150,120,80,0.4)', entrance: 'fade',
  },

  // ── London memorabilia ────────────────────────────────────────────────
  {
    id: 'ticket', kind: 'ticket',
    front: { zone: 'ZONE 1–2', fare: '£2.80', route: 'SINGLE FARE' },
    back: { note: 'Kept every ticket from that first month. Don\'t know why. Couldn\'t bring myself to throw them out.' },
    rotate: -5, pos: { x: 40, y: 28 }, posMobile: { x: 62, y: 52 },
    attach: 'clip', attachColor: '#8a8a92', entrance: 'rotate-in',
  },
  {
    id: 'passport', kind: 'passport',
    stamp: { city: 'LONDON', code: 'LHR', date: '14 SEP' },
    rotate: 4, pos: { x: 62, y: 30 }, posMobile: { x: 8, y: 52 },
    attach: null, entrance: 'fade',
  },
  {
    id: 'boarding-pass', kind: 'boardingPass',
    from: 'DEL', to: 'LHR', passenger: 'S. PAWAR', date: '12 SEP', seat: '24A', gate: 'B7',
    rotate: -3, pos: { x: 4, y: 62 }, posMobile: { x: 30, y: 66 },
    attach: 'tape', attachColor: 'rgba(60,90,140,0.4)', entrance: 'slide-left',
  },
  {
    id: 'postcard', kind: 'postcard',
    image: `${IMG}/life-in-london-op-10.webp`,
    note: 'Wish you were here — though honestly, most days it doesn\'t feel real that I am.',
    rotate: 5, pos: { x: 60, y: 66 }, posMobile: { x: 55, y: 66 },
    attach: 'cornerMounts', attachColor: '#8a8a92', entrance: 'fall',
  },
  {
    id: 'receipt', kind: 'receipt',
    cafe: 'The Corner Press', item: 'Flat white', price: '£3.40', date: '03/11',
    rotate: -6, pos: { x: 85, y: 62 }, posMobile: { x: 15, y: 92 },
    attach: 'tape', attachColor: 'rgba(150,120,80,0.4)', entrance: 'fade',
  },
  {
    id: 'map', kind: 'map',
    rotate: 3, pos: { x: 14, y: 78 }, posMobile: { x: 38, y: 86 },
    attach: 'washi', attachColor: 'oklch(78% 0.09 25)', entrance: 'rotate-in',
  },

  // ── Small stickers ────────────────────────────────────────────────────
  { id: 'sticker-1', kind: 'sticker', image: `${STICKER_DIR}/020c2cc1257769319789413081745a20.png`, width: 56,
    rotate: -12, pos: { x: 16, y: 2 }, posMobile: { x: 30, y: 2 }, entrance: 'fade' },
  { id: 'sticker-2', kind: 'sticker', image: `${STICKER_DIR}/4015da25ca9839ef2a8e5357757e7cf5.png`, width: 60,
    rotate: 10, pos: { x: 92, y: 40 }, posMobile: { x: 82, y: 34 }, entrance: 'fade' },
  { id: 'sticker-3', kind: 'sticker', image: `${STICKER_DIR}/b4f08520a9e4e57ed6282ea3399f8bc0.png`, width: 52,
    rotate: -8, pos: { x: 45, y: 82 }, posMobile: { x: 78, y: 88 }, entrance: 'fade' },
];
