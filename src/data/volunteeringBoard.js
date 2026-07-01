// ─────────────────────────────────────────────────────────────────────────
// Volunteering — digital mood board.
//
// Every item on the board (photo or sticky note) is described here, so the
// whole board can be rearranged / added to / re-captioned without touching
// the <VolunteeringBoard /> layout or interaction code.
//
// Shared fields
//   id            unique key
//   kind          'photo' | 'note'
//   pos           { x, y }   desktop position, % of the board area (top-left)
//   posMobile     { x, y }   optional mobile position, % of the taller board
//   rotate        resting tilt in degrees (-8…8)
//   attach        'pushpin' | 'washi' | 'tape' | 'clip' | 'binder'
//   attachColor   accent for the pin / tape
//
// Photo fields
//   style         'polaroid' | 'print' | 'instant' | 'postcard' | 'snapshot'
//   image         cover image
//   width         rendered width in px (desktop)
//   caption       small strip caption (polaroid / instant)
//   popup         { title, date, org, story[], gallery[] }
//
// Note fields
//   color         'yellow' | 'pink' | 'mint' | 'blue' | 'cream'
//   text          short handwritten line
//   sub           optional smaller line (a date / place)
// ─────────────────────────────────────────────────────────────────────────

const IMG = '/images/volunteering/optimised';

export const NOTE_COLORS = {
  yellow: { bg: 'oklch(93% 0.09 100)', edge: 'oklch(86% 0.10 100)' },
  pink:   { bg: 'oklch(91% 0.06 15)',  edge: 'oklch(85% 0.08 15)' },
  mint:   { bg: 'oklch(92% 0.06 155)', edge: 'oklch(86% 0.07 155)' },
  blue:   { bg: 'oklch(91% 0.05 240)', edge: 'oklch(85% 0.06 240)' },
  cream:  { bg: 'oklch(95% 0.03 85)',  edge: 'oklch(89% 0.04 85)' },
};

export const volunteeringBoard = [
  {
    id: 'food-drive',
    kind: 'photo',
    style: 'polaroid',
    image: `${IMG}/vol-op-1.webp`,
    width: 208,
    caption: 'Food drive · 2019',
    rotate: -6,
    pos: { x: 5, y: 14 },
    posMobile: { x: 6, y: 3 },
    attach: 'pushpin',
    attachColor: '#e0574a',
    popup: {
      title: 'Community Food Drive',
      date: 'Winter 2019',
      org: 'Local Food Bank',
      story: [
        'My first proper volunteering day, and I had no idea what I was doing. I turned up in completely the wrong shoes and spent six hours carrying crates.',
        'By the end of it I was exhausted, freezing, and quietly, completely hooked. There is something about handing a warm meal to someone who needed it that reorders your sense of what a day is worth.',
      ],
      gallery: [`${IMG}/vol-op-8.webp`, `${IMG}/vol-op-9.webp`],
    },
  },
  {
    id: 'note-first',
    kind: 'note',
    color: 'yellow',
    text: 'First community drive',
    sub: 'where it all started',
    rotate: 4,
    pos: { x: 27, y: 5 },
    posMobile: { x: 58, y: 2 },
    attach: 'washi',
    attachColor: 'oklch(80% 0.09 25)',
  },
  {
    id: 'teaching',
    kind: 'photo',
    style: 'print',
    image: `${IMG}/vol-op-2.webp`,
    width: 224,
    rotate: 3,
    pos: { x: 23, y: 25 },
    posMobile: { x: 8, y: 20 },
    attach: 'tape',
    attachColor: 'rgba(210,190,150,0.55)',
    popup: {
      title: 'After-School Teaching',
      date: 'Spring 2021',
      org: 'Neighbourhood Learning Project',
      story: [
        'Every Tuesday evening I helped a small group of kids with their reading and maths. Half the time they taught me more than I taught them.',
        'Watching a child go from dreading a subject to putting their hand up first is a particular kind of joy I did not expect to find in a borrowed classroom.',
      ],
      gallery: [`${IMG}/vol-op-10.webp`, `${IMG}/vol-op-11.webp`],
    },
  },
  {
    id: 'cleanup',
    kind: 'photo',
    style: 'instant',
    image: `${IMG}/vol-op-3.webp`,
    width: 190,
    caption: 'Clean-up crew',
    rotate: -5,
    pos: { x: 47, y: 9 },
    posMobile: { x: 52, y: 22 },
    attach: 'pushpin',
    attachColor: '#3a7be0',
    popup: {
      title: 'Riverside Clean-Up',
      date: 'Summer 2021',
      org: 'City Green Initiative',
      story: [
        'A hundred of us, gloves on, combing the riverbank at eight in the morning. By noon the difference was visible from the bridge.',
        'It was the first time I really understood that small, unglamorous effort, multiplied by enough willing hands, genuinely changes a place.',
      ],
      gallery: [`${IMG}/vol-op-12.webp`, `${IMG}/vol-op-13.webp`],
    },
  },
  {
    id: 'note-best',
    kind: 'note',
    color: 'pink',
    text: 'Best day ever',
    sub: '♡',
    rotate: 5,
    pos: { x: 60, y: 4 },
    posMobile: { x: 8, y: 40 },
    attach: 'pushpin',
    attachColor: '#d95a86',
  },
  {
    id: 'postcard',
    kind: 'photo',
    style: 'postcard',
    image: `${IMG}/vol-op-4.webp`,
    width: 262,
    rotate: 3,
    pos: { x: 66, y: 15 },
    posMobile: { x: 40, y: 42 },
    attach: 'washi',
    attachColor: 'oklch(82% 0.08 200)',
    popup: {
      title: 'Winter Shelter Nights',
      date: 'Winter 2022',
      org: 'Nightshelter Volunteers',
      story: [
        'Overnight shifts at the shelter — making tea, sorting bedding, mostly just sitting and listening to people whose stories rarely get heard.',
        'I learned that presence is its own kind of help. Sometimes the most useful thing you can offer someone is the simple dignity of being seen.',
      ],
      gallery: [`${IMG}/vol-op-14.webp`, `${IMG}/vol-op-15.webp`],
    },
  },
  {
    id: 'people',
    kind: 'photo',
    style: 'snapshot',
    image: `${IMG}/vol-op-5.webp`,
    width: 196,
    rotate: 6,
    pos: { x: 45, y: 36 },
    posMobile: { x: 50, y: 60 },
    attach: 'clip',
    attachColor: '#b8b8be',
    popup: {
      title: 'The People',
      date: 'Across the years',
      org: 'Everyone I met along the way',
      story: [
        'The volunteering was never really about the tasks. It was about the people — the other volunteers who became friends, the strangers who became stories.',
        'Every drive, every shift, every clean-up added a few more faces to a collection I will carry for the rest of my life.',
      ],
      gallery: [`${IMG}/vol-op-16.webp`, `${IMG}/vol-op-17.webp`],
    },
  },
  {
    id: 'note-people',
    kind: 'note',
    color: 'mint',
    text: 'Met amazing people',
    rotate: -4,
    pos: { x: 8, y: 46 },
    posMobile: { x: 55, y: 78 },
    attach: 'tape',
    attachColor: 'rgba(200,205,170,0.6)',
  },
  {
    id: 'session',
    kind: 'photo',
    style: 'polaroid',
    image: `${IMG}/vol-op-6.webp`,
    width: 206,
    caption: 'Teaching session',
    rotate: 5,
    pos: { x: 25, y: 51 },
    posMobile: { x: 6, y: 60 },
    attach: 'pushpin',
    attachColor: '#c9a04f',
    popup: {
      title: 'Skills Workshop',
      date: 'Autumn 2022',
      org: 'Community Skills Exchange',
      story: [
        'A weekend spent running a small workshop, passing on the little I knew to people eager to learn it. Nerve-wracking and deeply rewarding in equal measure.',
        'Teaching forces you to understand something twice as well. I walked away having learned as much about myself as I taught about anything else.',
      ],
      gallery: [`${IMG}/vol-op-18.webp`, `${IMG}/vol-op-7.webp`],
    },
  },
  {
    id: 'smiles',
    kind: 'photo',
    style: 'print',
    image: `${IMG}/vol-op-7.webp`,
    width: 226,
    rotate: -5,
    pos: { x: 67, y: 46 },
    posMobile: { x: 40, y: 80 },
    attach: 'binder',
    attachColor: '#3a3a3a',
    popup: {
      title: 'Fundraising Fair',
      date: 'Summer 2023',
      org: 'Charity Collective',
      story: [
        'A whole day of stalls, raffles and far too much cake, all in aid of a cause close to my heart. The community turned out in a way that genuinely moved me.',
        'We raised more than we ever expected. But the real total was in the faces of everyone who showed up to make it happen.',
      ],
      gallery: [`${IMG}/vol-op-1.webp`, `${IMG}/vol-op-2.webp`],
    },
  },
  {
    id: 'note-clean',
    kind: 'note',
    color: 'blue',
    text: 'Clean-up drive',
    sub: '8am starts!',
    rotate: 6,
    pos: { x: 79, y: 8 },
    posMobile: { x: 55, y: 90 },
    attach: 'washi',
    attachColor: 'oklch(80% 0.07 250)',
  },
];
