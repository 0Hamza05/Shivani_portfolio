import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { travelDestinations } from "../data/travelDestinations";

// The map SVG is cropped (via its viewBox) to just the region around the
// used pins, so this ratio matches that cropped region, not the full world.
const SVG_RATIO = 555.32 / 279.7045;
const TRAIL_SAMPLE_DIST = 0.7;
// Zoom applied to the whole map+pins+labels group, centered on the actual
// bounding box of every destination (pin + label anchor) so the crop stays
// tighter without clipping Thailand/Dubai, which sit farthest from the
// European cluster.
const MAP_ZOOM = 1.2;
const MAP_ZOOM_ORIGIN = "50% 56%";

export default function TravelMap() {
  const [activeDestination, setActiveDestination] = useState(travelDestinations[0]);
  const [planePosition, setPlanePosition] = useState({
    x: parseFloat(travelDestinations[0].mapPosition.x),
    y: parseFloat(travelDestinations[0].mapPosition.y),
  });
  const [planeAngle, setPlaneAngle] = useState(0);
  const [mapArea, setMapArea] = useState(null);

  const trailRef = useRef([]);
  const rafRef = useRef(null);
  const planePositionRef = useRef(planePosition);
  const mapImgRef = useRef(null);

  useEffect(() => {
    const compute = () => {
      const img = mapImgRef.current;
      if (!img) return;
      const bW = img.clientWidth;
      const bH = img.clientHeight;
      if (!bW || !bH) return;

      let offX, offY, rW, rH;
      if (bW / bH > SVG_RATIO) {
        rH = bH; rW = bH * SVG_RATIO;
        offX = (bW - rW) / 2; offY = 0;
      } else {
        rW = bW; rH = bW / SVG_RATIO;
        offX = 0; offY = (bH - rH) / 2;
      }
      setMapArea({ offX, offY, rW, rH });
    };

    const img = mapImgRef.current;
    if (img) {
      if (img.complete) compute();
      img.addEventListener("load", compute);
    }
    window.addEventListener("resize", compute);
    return () => {
      if (img) img.removeEventListener("load", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const toPixel = (pctX, pctY) => {
    if (!mapArea) return null;
    return {
      x: mapArea.offX + (pctX / 100) * mapArea.rW,
      y: mapArea.offY + (pctY / 100) * mapArea.rH,
    };
  };

  const handlePinClick = (id) => {
    const destination = travelDestinations.find((d) => d.id === id);
    if (!destination) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    trailRef.current = [];

    const startX = planePositionRef.current.x;
    const startY = planePositionRef.current.y;
    const endX = parseFloat(destination.mapPosition.x);
    const endY = parseFloat(destination.mapPosition.y);

    setPlaneAngle(Math.atan2(endY - startY, endX - startX) * (180 / Math.PI));

    const duration = 1400;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const controlX = (startX + endX) / 2;
      const controlY = Math.min(startY, endY) - 12;

      const x =
        (1 - eased) * (1 - eased) * startX +
        2 * (1 - eased) * eased * controlX +
        eased * eased * endX;
      const y =
        (1 - eased) * (1 - eased) * startY +
        2 * (1 - eased) * eased * controlY +
        eased * eased * endY;

      const trail = trailRef.current;
      const last = trail[trail.length - 1];
      const dist = last ? Math.sqrt((x - last.x) ** 2 + (y - last.y) ** 2) : Infinity;
      if (dist >= TRAIL_SAMPLE_DIST) trail.push({ x, y });

      const pos = { x, y };
      planePositionRef.current = pos;
      setPlanePosition(pos);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
        setActiveDestination(destination);
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          const scrollMarginTop = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
          const targetY = Math.max(0, window.scrollY + rect.top - scrollMarginTop);
          // Skip the scroll entirely for negligible deltas — smooth-scrolling
          // a few px triggers browser overscroll/bounce without moving anything
          // meaningfully, which read as the map glitching on the first click.
          if (Math.abs(targetY - window.scrollY) > 24) {
            window.scrollTo({ top: targetY, behavior: "smooth" });
          }
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  const trail = trailRef.current;
  const trailTotal = trail.length;
  const isActive = (id) => activeDestination.id === id;

  const handlePinKeyDown = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePinClick(id);
    }
  };

  const planePixel = toPixel(planePosition.x, planePosition.y);

  // CSS transform to anchor label text at the correct edge of the line endpoint
  const labelTransform = (offset) => {
    const tx = offset.x < -0.5 ? "-100%" : offset.x > 0.5 ? "0%" : "-50%";
    const ty = offset.y < -0.5 ? "-100%" : offset.y > 0.5 ? "0%" : "-50%";
    return `translate(${tx}, ${ty})`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.70, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ width: "100%", background: "var(--bg)" }}
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute", width: "1px", height: "1px",
          overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap",
        }}
      >
        {activeDestination ? `Now showing ${activeDestination.title}` : ""}
      </div>

      <style>{`
        .travel-pin:focus-visible {
          outline: 2px solid #1e3a8a;
          outline-offset: 6px;
          border-radius: 6px;
        }
        .travel-pin:focus:not(:focus-visible) { outline: none; }
        .travel-pin-tear {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .travel-pin:hover .travel-pin-tear {
          transform: rotate(-45deg) scale(1.15);
          box-shadow: 0 0 22px rgba(30,58,138,0.55);
        }
        /* Matches the map SVG's own aspect ratio exactly, so the box is
           filled edge-to-edge with no empty letterbox strip above/below —
           previously a fixed vh-tall box let the (much wider) map shrink to
           fit, leaving large blank bands and badly compressing vertical
           spacing between pins relative to horizontal. */
        .travel-map-viewport {
          aspect-ratio: 555.32 / 279.7045;
          min-height: 200px;
        }
        .travel-label {
          font-size: 0.52rem;
          letter-spacing: 0.13em;
          padding: 4px 2px;
        }
        @media (max-width: 700px) {
          .travel-label {
            font-size: 0.4rem;
            letter-spacing: 0.06em;
            padding: 2px 1px;
          }
        }
      `}</style>

      <div
        className="travel-map-viewport"
        style={{
          width: "100%",
          maxWidth: "1500px",
          margin: "12px auto 12px -4%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Zoomed group — map image, trail, plane, pins and labels all scale
            together as one unit so everything stays perfectly aligned; the
            viewport above clips the overflow. */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transform: `scale(${MAP_ZOOM})`,
            transformOrigin: MAP_ZOOM_ORIGIN,
          }}
        >
        <img
          ref={mapImgRef}
          src="/maps/world-map.svg"
          alt="Interactive world map showing travel destinations"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 0.72,
            filter: "brightness(0) saturate(100%) invert(86%) sepia(90%) saturate(850%) brightness(97%)",
            display: "block",
          }}
        />

        {/* Flight trail dots */}
        <svg
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", overflow: "visible",
          }}
        >
          {trail.map((pt, i) => {
            const px = toPixel(pt.x, pt.y);
            if (!px) return null;
            const t = (i + 1) / trailTotal;
            return (
              <circle
                key={i}
                cx={px.x} cy={px.y}
                r={1.4 + t * 1.6}
                fill="#7EB8F7"
                opacity={t * 0.8}
              />
            );
          })}
        </svg>

        {/* Airplane */}
        <div
          style={{
            position: "absolute",
            left: planePixel ? `${planePixel.x}px` : `${planePosition.x}%`,
            top:  planePixel ? `${planePixel.y}px` : `${planePosition.y}%`,
            transform: `translate(-50%, -50%) rotate(${planeAngle}deg)`,
            fontSize: "2.1rem",
            color: "#7EB8F7",
            filter: "drop-shadow(0 0 8px rgba(126,184,247,0.70))",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          ✈
        </div>

        {/* Pin dots (click targets) */}
        {travelDestinations.map((destination) => {
          const px = toPixel(
            parseFloat(destination.mapPosition.x),
            parseFloat(destination.mapPosition.y)
          );
          const posStyle = px
            ? { left: `${px.x}px`, top: `${px.y}px` }
            : { left: destination.mapPosition.x, top: destination.mapPosition.y };
          const active = isActive(destination.id);

          return (
            <div
              key={destination.id}
              role="button"
              tabIndex={0}
              aria-label={
                active
                  ? `${destination.title} — current destination`
                  : `Navigate to ${destination.title}`
              }
              aria-current={active ? "true" : undefined}
              onClick={() => handlePinClick(destination.id)}
              onKeyDown={(e) => handlePinKeyDown(e, destination.id)}
              className="travel-pin"
              style={{
                position: "absolute",
                zIndex: active ? 100 : 10,
                ...posStyle,
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
              }}
            >
              <div
                className="travel-pin-tear"
                style={{
                  position: "relative",
                  width: "13px",
                  height: "13px",
                  background: "#1e3a8a",
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg)",
                  boxShadow: active
                    ? "0 0 12px rgba(30,58,138,0.60)"
                    : "0 0 8px rgba(30,58,138,0.35)",
                  border: "1.5px solid white",
                }}
              >
                <div style={{
                  position: "absolute",
                  width: "4px",
                  height: "4px",
                  background: "white",
                  borderRadius: "50%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }} />
              </div>
            </div>
          );
        })}

        {/* Destination labels */}
        {mapArea && travelDestinations.map((dest) => {
          const pinPct = { x: parseFloat(dest.mapPosition.x), y: parseFloat(dest.mapPosition.y) };
          const lx = toPixel(
            pinPct.x + dest.labelOffset.x,
            pinPct.y + dest.labelOffset.y
          );
          if (!lx) return null;
          const active = isActive(dest.id);

          return (
            <div
              key={dest.id + "-label"}
              role="button"
              tabIndex={0}
              aria-label={active ? `${dest.title} — current destination` : `Navigate to ${dest.title}`}
              aria-current={active ? "true" : undefined}
              onClick={() => handlePinClick(dest.id)}
              onKeyDown={(e) => handlePinKeyDown(e, dest.id)}
              className="travel-label"
              style={{
                position: "absolute",
                left: `${lx.x}px`,
                top: `${lx.y}px`,
                transform: labelTransform(dest.labelOffset),
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
                fontWeight: 600,
                textTransform: "uppercase",
                color: active
                  ? "rgba(30, 58, 138, 1)"
                  : "rgba(30, 58, 138, 0.65)",
                transition: "color 0.2s ease, opacity 0.2s ease",
                zIndex: active ? 110 : 20,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(30, 58, 138, 1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = active ? "rgba(30, 58, 138, 1)" : "rgba(30, 58, 138, 0.65)"; }}
            >
              {dest.title}
            </div>
          );
        })}
        </div>
      </div>
    </motion.div>
  );
}
