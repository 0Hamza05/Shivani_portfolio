// ─────────────────────────────────────────────────────────────────────────
// University puzzle — data-driven pieces.
//
// The <UniversityPuzzle /> layout is entirely driven by this array: the grid
// position, the entrance direction and every scrap of popup copy live here so
// the content can be edited (or wired to a CMS) without touching the layout
// or animation code. Add / remove / reorder entries and the puzzle re-lays
// itself, as long as `grid` still describes a valid cols×rows arrangement.
//
// Fields per piece:
//   slug        unique id
//   title       pillar name (shown in popup + hover label)
//   category    small eyebrow label
//   media       { type: 'image' | 'video', src, poster? }
//   accent      one of the three brand-adjacent glows (blue|yellow|pink)
//   cell        { c, r } zero-indexed column/row in the puzzle grid
//   from        entrance origin: 'top-left'|'top'|'top-right'|'left'|'right'|'bottom'
//   popup       { intro, paragraphs[], quote?, gallery?[] }
// ─────────────────────────────────────────────────────────────────────────

export const PUZZLE_GRID = { cols: 3, rows: 2 };

export const universityPieces = [
  {
    slug: 'friends',
    title: 'Friends',
    category: 'The people',
    media: { type: 'image', src: '/images/university/optimised/uni-op-2.webp' },
    accent: 'pink',
    cell: { c: 0, r: 0 },
    from: 'top-left',
    popup: {
      intro: 'The ones who turned a city of strangers into a home.',
      paragraphs: [
        'You arrive not knowing a single face, and somehow within weeks there are people who know how you take your coffee and which songs make you cry.',
        'University friendships are built at odd hours — corridor conversations that last until sunrise, shared plates of food when money was tight, the quiet loyalty of someone waiting up until you got back safe.',
        'These are the people who saw the version of me that was still figuring everything out, and stayed anyway.',
      ],
      quote: 'We were all just kids pretending to be adults, holding onto each other while we learned how.',
      gallery: [
        '/images/university/uni-3.webp',
        '/images/university/uni-4.webp',
      ],
    },
  },
  {
    slug: 'academics',
    title: 'Academics',
    category: 'The work',
    media: { type: 'image', src: '/images/university/optimised/uni-op-3.webp' },
    accent: 'blue',
    cell: { c: 1, r: 0 },
    from: 'top',
    popup: {
      intro: 'Lecture halls, library corners and the slow thrill of understanding.',
      paragraphs: [
        'There is a particular kind of quiet in a library at 2am — the hum of everyone chasing the same deadline, the comfort of not being alone in the struggle.',
        'I learned that intelligence is far less about being naturally gifted and far more about showing up, again and again, even when the material refused to make sense.',
        'The grades faded in importance the moment I realised what I was really collecting was the ability to teach myself anything.',
      ],
      quote: 'The degree was the certificate. The real qualification was learning how to think.',
    },
  },
  {
    slug: 'campus-life',
    title: 'Campus Life',
    category: 'The everyday',
    media: { type: 'image', src: '/images/university/optimised/uni-op-4.webp' },
    accent: 'yellow',
    cell: { c: 2, r: 0 },
    from: 'top-right',
    popup: {
      intro: 'Societies, spontaneous plans and the ordinary magic of belonging.',
      paragraphs: [
        'Campus life is the stuff between the timetable — the society you joined on a whim, the walk that turned into a three-hour conversation, the festivals and the fire drills at 3am.',
        'It taught me to say yes more often, to let the day take an unplanned turn, to find joy in the small rituals of a place that briefly felt like the whole world.',
      ],
      gallery: [
        '/images/university/uni-5.webp',
        '/images/university/uni-6.webp',
      ],
    },
  },
  {
    slug: 'independence',
    title: 'Independence',
    category: 'The becoming',
    media: { type: 'image', src: '/images/university/optimised/uni-op-5.webp' },
    accent: 'blue',
    cell: { c: 0, r: 1 },
    from: 'left',
    popup: {
      intro: 'Learning to hold my own life in my own two hands.',
      paragraphs: [
        'Moving across the world at seventeen means growing up quickly — the first flat, the first budget stretched too thin, the first time something broke and there was no one to call but yourself.',
        'Independence is unglamorous. It is groceries and laundry and homesickness swallowed quietly. But it is also the deep, steadying pride of realising you can, in fact, do this.',
      ],
      quote: 'I stopped waiting to feel ready and simply became the person who handled it.',
    },
  },
  {
    slug: 'personal-growth',
    title: 'Personal Growth',
    category: 'The change',
    media: { type: 'video', src: '/images/university/uni-1.mp4' },
    accent: 'pink',
    cell: { c: 1, r: 1 },
    from: 'bottom',
    popup: {
      intro: 'The quiet, invisible work of becoming yourself.',
      paragraphs: [
        'No one hands you a transcript for this one. The growth happened in the background — in the boundaries I learned to set, the opinions I learned to hold, the confidence that arrived so gradually I only noticed it in hindsight.',
        'I walked in as one person and walked out as someone I actually recognised. That transformation is the thing I am proudest of.',
      ],
      quote: 'University did not just teach me things. It rearranged who I was willing to be.',
    },
  },
  {
    slug: 'graduation',
    title: 'Graduation',
    category: 'The threshold',
    media: { type: 'image', src: '/images/university/optimised/uni-op-6.webp' },
    accent: 'yellow',
    cell: { c: 2, r: 1 },
    from: 'right',
    popup: {
      intro: 'A gown, a stage, and the strange weight of an ending.',
      paragraphs: [
        'Graduation is a single afternoon asked to hold years of effort. The cap, the walk, the name called out — and then, suddenly, it is over.',
        'I remember scanning the crowd for the faces that got me there, feeling the whole thing land at once: the homesickness, the all-nighters, the friendships, the person I had quietly become.',
        'It was not the finish line I expected. It was a door, and I was finally ready to walk through it.',
      ],
      quote: 'Every piece of it — the joy and the hard parts — shaped the person crossing that stage.',
    },
  },
];

// Which interior seams carry a tab vs a blank. Kept here (rather than random)
// so the interlock is deterministic and visually tuned. Values are read by the
// jigsaw path generator in UniversityPuzzle.
//   hTab[c]      = tab config for the horizontal seam under column c
//                  (upper cell's BOTTOM edge; lower cell's TOP edge is the
//                  complementary blank).
//   vTab[r][k]   = tab config for the vertical seam between columns k and k+1
//                  on row r (left cell's RIGHT edge; right cell's LEFT edge is
//                  the complementary blank).  +1 = tab out, -1 = tab in.
export const PUZZLE_TABS = {
  hTab: [1, -1, 1],
  vTab: [
    [1, -1],
    [-1, 1],
  ],
};
