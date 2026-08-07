// Pin positions: SVG-percentage coordinates (equirectangular x, Web Mercator y).
// labelOffset: percentage-point delta from pin to label anchor — kept small
// so the label sits right next to its own pin (no connecting line anymore,
// so proximity alone has to make the pairing obvious). For the five pins
// packed into the small European cluster (Paris/Prague/Germany/Amsterdam/
// Italy), each offset points outward from that cluster's own centroid so
// the five directions stay spread apart instead of converging on each
// other. Prague/Germany and Portugal/Italy still sit close enough that
// their labels lightly touch at narrow widths — each is still unambiguously
// nearer its own pin, just tight; see TravelMap.jsx's .travel-label rules
// for the mobile font-size step-down that keeps it readable there.
// photos: two travel images shown as polaroids in the blog section.
export const travelDestinations = [
  {
    id: "paris",
    title: "Paris",
    mapPosition: { x: "28.53%", y: "42.45%" },
    labelOffset: { x: -2, y: 0.4 },
    photos: ["/images/travel/Paris/paris1_result.webp", "/images/travel/Paris/paris2_result.webp"],
    story: [
      "When I was 17, I moved from India to the UK with a suitcase and very little else. On one of my first days in the university accommodation, I spotted another Indian girl unpacking across the hall. We've been inseparable ever since.",
      "Divya and I made three promises to each other somewhere between those early university days and figuring out what adulthood was supposed to look like - get jobs in London, visit Paris, visit New York.",
      "The kind of dreams that feel almost too bright to say out loud when you're new to a country and still finding your footing.",
      "A few years after graduating, we finally made it to Paris.",
      "It was everything and nothing extravagant. Hot chocolate, pastries, cobblestone streets, and the Eiffel Tower sparkling at night like it had been waiting for us. Simple things that felt enormous, because of everything they represented. Two girls who had held onto a dream for seven years and then quietly, steadily, made it real.",
      "Two out of three done.",
      "New York, we're coming.",
    ],
  },
  {
    id: "prague",
    title: "Prague",
    mapPosition: { x: "34.58%", y: "40.55%" },
    labelOffset: { x: 1.8, y: -0.9 },
    photos: ["/images/travel/Prague/prague1_result.webp", "/images/travel/Prague/prague2_result.webp"],
  },
  {
    id: "portugal",
    title: "Portugal",
    mapPosition: { x: "22.69%", y: "56.52%" },
    labelOffset: { x: 0.7, y: 2 },
    photos: ["/images/travel/travel-5.webp", "/images/travel/travel-6.webp"],
  },
  {
    id: "thailand",
    title: "Thailand",
    mapPosition: { x: "78.18%", y: "84.76%" },
    labelOffset: { x: -1.4, y: -1.2 },
    photos: ["/images/travel/Thailand/thailand1_result.webp", "/images/travel/Thailand/thailand2_result.webp"],
  },
  {
    id: "germany",
    title: "Germany",
    mapPosition: { x: "34.05%", y: "36.62%" },
    labelOffset: { x: 0.7, y: -1.9 },
    photos: ["/images/travel/travel-9.webp", "/images/travel/travel-10.webp"],
  },
  {
    id: "italy",
    title: "Italy",
    mapPosition: { x: "33.58%", y: "52.43%" },
    labelOffset: { x: 0.3, y: 2 },
    photos: ["/images/travel/Italy/italy1_result.webp", "/images/travel/travel-12.jpg"],
  },
  {
    id: "amsterdam",
    title: "Amsterdam",
    mapPosition: { x: "29.78%", y: "36.83%" },
    labelOffset: { x: -0.9, y: -1.8 },
    photos: ["/images/travel/travel-13.webp", "/images/travel/travel-14.jpg"],
  },
  {
    id: "dubai",
    title: "Dubai",
    mapPosition: { x: "55.24%", y: "72.62%" },
    labelOffset: { x: 1.4, y: -1.2 },
    photos: ["/images/travel/travel-15.webp", "/images/travel/travel-16.webp"],
  },
];
