import { useState, useRef } from "react";
import { travelDestinations } from "../data/travelDestinations";

// Minimum map-percentage distance between sampled trail dots.
// Keeps dot spacing visually even regardless of how fast the plane is moving.
const TRAIL_SAMPLE_DIST = 0.7;

export default function TravelMap() {
  const [activeDestination, setActiveDestination] = useState(travelDestinations[0]);
  const [planePosition, setPlanePosition] = useState({
    x: parseFloat(travelDestinations[0].mapPosition.x),
    y: parseFloat(travelDestinations[0].mapPosition.y),
  });
  const [planeAngle, setPlaneAngle] = useState(0);
  // Trail stored as a ref so pushes don't cause extra re-renders —
  // the SVG reads it during the re-renders already triggered by setPlanePosition.
  const trailRef = useRef([]);

  const rafRef = useRef(null);
  const planePositionRef = useRef(planePosition);

  const handlePinClick = (id) => {
    const destination = travelDestinations.find((d) => d.id === id);
    if (!destination) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Clear previous trail on each new flight
    trailRef.current = [];

    const startX = planePositionRef.current.x;
    const startY = planePositionRef.current.y;
    const endX = parseFloat(destination.mapPosition.x);
    const endY = parseFloat(destination.mapPosition.y);

    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
    setPlaneAngle(angle);

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

      // Sample a new trail dot only when the plane has moved far enough from the last one
      const trail = trailRef.current;
      const last = trail[trail.length - 1];
      const dist = last
        ? Math.sqrt((x - last.x) ** 2 + (y - last.y) ** 2)
        : Infinity;
      if (dist >= TRAIL_SAMPLE_DIST) {
        trail.push({ x, y });
      }

      const pos = { x, y };
      planePositionRef.current = pos;
      setPlanePosition(pos);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        rafRef.current = null;
        setActiveDestination(destination);
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
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

  return (
    <div style={{ width: "100%", background: "var(--bg)" }}>
      {/* Screen-reader live region: announces destination name when plane lands */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        {activeDestination ? `Now showing ${activeDestination.title}` : ""}
      </div>

      <style>{`
        .travel-pin:focus-visible {
          outline: 2px solid #9a5c00;
          outline-offset: 6px;
          border-radius: 6px;
        }
        .travel-pin:focus:not(:focus-visible) {
          outline: none;
        }
        .travel-map-img {
          height: 90vh;
        }
        @media (max-width: 960px) {
          .travel-map-img {
            height: 56vw;
            min-height: 200px;
          }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "1500px",
          margin: "0 auto",
          paddingTop: "12px",
          paddingBottom: "12px",
          position: "relative",
        }}
      >
        {/* Map */}
        <img
          src="/maps/world-map.svg"
          alt="Interactive world map showing travel destinations"
          className="travel-map-img"
          style={{
            width: "100%",
            objectFit: "contain",
            opacity: 0.92,
            filter:
              "invert(78%) sepia(38%) saturate(540%) hue-rotate(357deg) brightness(101%) contrast(98%)",
            display: "block",
          }}
        />

        {/* Trail — SVG overlay sized to match the map container */}
        {trailTotal > 0 && (
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            {trail.map((pt, i) => {
              // Opacity ramps from ~0 at the oldest dot to 0.8 at the newest
              const t = (i + 1) / trailTotal;
              const opacity = t * 0.8;
              // Dots also grow slightly toward the current position
              const r = 1.4 + t * 1.6;
              return (
                <circle
                  key={i}
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  r={r}
                  fill="#9a5c00"
                  opacity={opacity}
                />
              );
            })}
          </svg>
        )}

        {/* Airplane */}
        <div
          style={{
            position: "absolute",
            left: `${planePosition.x}%`,
            top: `${planePosition.y}%`,
            transform: `translate(-50%, -50%) rotate(${planeAngle}deg)`,
            fontSize: "1.6rem",
            color: "#9a5c00",
            filter: "drop-shadow(0 0 6px rgba(154,92,0,0.45))",
            zIndex: 50,
            pointerEvents: "none",
          }}
        >
          ✈
        </div>

        {/* Pins */}
        {travelDestinations.map((destination) => (
          <div
            key={destination.id}
            role="button"
            tabIndex={0}
            aria-label={
              isActive(destination.id)
                ? `${destination.title} — current destination`
                : `Navigate to ${destination.title}`
            }
            aria-current={isActive(destination.id) ? "true" : undefined}
            onClick={() => handlePinClick(destination.id)}
            onKeyDown={(e) => handlePinKeyDown(e, destination.id)}
            className="travel-pin"
            style={{
              position: "absolute",
              zIndex: isActive(destination.id) ? 100 : 10,
              left: destination.mapPosition.x,
              top: destination.mapPosition.y,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {/* Label */}
            <div
              style={{
                marginBottom: "10px",
                padding: "6px 12px",
                background: isActive(destination.id)
                    ? "rgba(255,255,255,0.96)"
                    : "rgba(255,255,255,0.65)",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "999px",
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isActive(destination.id)
                    ? "var(--fg)"
                    : "var(--fg-dim)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              {destination.title}
            </div>

            {/* Pin */}
            <div
              style={{
                position: "relative",
                width: "20px",
                height: "20px",
                background: "#9a5c00",
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                boxShadow: "0 0 18px rgba(154,92,0,0.35)",
                border: "2px solid white",
                transition: "transform 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "rotate(-45deg) scale(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotate(-45deg) scale(1)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "6px",
                  height: "6px",
                  background: "white",
                  borderRadius: "50%",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
