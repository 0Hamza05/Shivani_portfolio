// Pin positions: SVG-percentage coordinates (equirectangular x, Web Mercator y).
// labelOffset: percentage-point delta from pin to leader-line label anchor.
// Directions chosen so European labels radiate without crossing lines.
// photos: two travel images shown as polaroids in the blog section.
export const travelDestinations = [
  {
    id: "paris",
    title: "Paris",
    mapPosition: { x: "47.69%", y: "45.83%" },
    labelOffset: { x: -8.5, y: 0 },
    photos: ["/images/travel/travel-1.webp", "/images/travel/travel-2.webp"],
  },
  {
    id: "prague",
    title: "Prague",
    mapPosition: { x: "51.02%", y: "45.03%" },
    labelOffset: { x: 6.5, y: -6 },
    photos: ["/images/travel/travel-3.webp", "/images/travel/travel-4.webp"],
  },
  {
    id: "portugal",
    title: "Portugal",
    mapPosition: { x: "44.48%", y: "51.74%" },
    labelOffset: { x: -6.5, y: 6 },
    photos: ["/images/travel/travel-5.webp", "/images/travel/travel-6.webp"],
  },
  {
    id: "thailand",
    title: "Thailand",
    mapPosition: { x: "75.00%", y: "63.60%" },
    labelOffset: { x: 5.5, y: 0 },
    photos: ["/images/travel/travel-7.webp", "/images/travel/travel-8.webp"],
  },
  {
    id: "germany",
    title: "Germany",
    mapPosition: { x: "50.73%", y: "43.38%" },
    labelOffset: { x: 0, y: -9 },
    photos: ["/images/travel/travel-9.webp", "/images/travel/travel-10.webp"],
  },
  {
    id: "italy",
    title: "Italy",
    mapPosition: { x: "50.47%", y: "50.02%" },
    labelOffset: { x: 0, y: 8 },
    photos: ["/images/travel/travel-11.webp", "/images/travel/travel-12.jpg"],
  },
  {
    id: "amsterdam",
    title: "Amsterdam",
    mapPosition: { x: "48.38%", y: "43.47%" },
    labelOffset: { x: -6.5, y: -8 },
    photos: ["/images/travel/travel-13.webp", "/images/travel/travel-14.jpg"],
  },
  {
    id: "dubai",
    title: "Dubai",
    mapPosition: { x: "62.38%", y: "58.50%" },
    labelOffset: { x: 5, y: -5.5 },
    photos: ["/images/travel/travel-15.webp", "/images/travel/travel-16.webp"],
  },
];
