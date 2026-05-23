import { useEffect, useState } from "react";
import { travelDestinations } from "../data/travelDestinations";

export default function TravelMap() {

   const [activeDestination, setActiveDestination] = useState(
  travelDestinations[0]
);

const [planePosition, setPlanePosition] = useState({
  x: parseFloat(travelDestinations[0].mapPosition.x),
  y: parseFloat(travelDestinations[0].mapPosition.y)
});

  const handlePinClick = (id) => {

  const destination = travelDestinations.find(
    (d) => d.id === id
  );

  if (!destination) return;

  const startX = planePosition.x;
  const startY = planePosition.y;

  const endX = parseFloat(destination.mapPosition.x);
  const endY = parseFloat(destination.mapPosition.y);

  const duration = 1400;

  const startTime = performance.now();

  const animate = (currentTime) => {

    const elapsed = currentTime - startTime;

    const progress = Math.min(elapsed / duration, 1);

    // Smooth easing
    const eased =
      1 - Math.pow(1 - progress, 3);

    // Linear interpolation
    // Elevated midpoint control point
const controlX =
  (startX + endX) / 2;

const controlY =
  Math.min(startY, endY) - 12;

// Quadratic Bézier interpolation
const x =
  (1 - eased) * (1 - eased) * startX +
  2 * (1 - eased) * eased * controlX +
  eased * eased * endX;

const y =
  (1 - eased) * (1 - eased) * startY +
  2 * (1 - eased) * eased * controlY +
  eased * eased * endY;

    setPlanePosition({
      x,
      y
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {

      setActiveDestination(destination);

      const section =
        document.getElementById(id);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  };

  requestAnimationFrame(animate);
};

  return (
    <div
      style={{
       

        width: "100%",

        background: "var(--bg)",

       
      }}
    >
      <div
        style={{
          width: "100%",

          maxWidth: "1500px",

          margin: "0 auto",

          paddingTop: "12px",
          paddingBottom: "12px",

          position: "relative"
        }}
      >
        {/* Map */}
        <img
        
          src="/maps/world-map.svg"
          alt="World Map"
          style={{
            width: "100%",

            height: "90vh",

            objectFit: "contain",

            opacity: 0.92,

         filter:
  "invert(78%) sepia(38%) saturate(540%) hue-rotate(357deg) brightness(101%) contrast(98%)",
            
  display: "block"
          }}
        />
        


          {/* Airplane */}
<div
  style={{
    position: "absolute",

    left: `${planePosition.x}%`,
top: `${planePosition.y}%`,

   transform: "translate(-50%, -50%)",

    fontSize: "2rem",

    color: "red",

    textShadow: "0 0 18px rgba(255,255,255,0.45)",

    
    zIndex: 50,

    pointerEvents: "none"
  }}
>
  ✈
</div>

        {/* Pins */}
        {travelDestinations.map((destination) => (
          <div
            key={destination.id}

            onClick={() => handlePinClick(destination.id)}

            style={{
              position: "absolute",

              zIndex:
             activeDestination.id === destination.id
                ? 100
                : 10,

              left: destination.mapPosition.x,
              top: destination.mapPosition.y,

              transform: "translate(-50%, -50%)",

              display: "flex",
              flexDirection: "column",
              alignItems: "center",

              cursor: "pointer"
            }}
          >
            {/* Label */}
            <div
              style={{
                marginBottom: "10px",

                padding: "6px 12px",

                background:
                    activeDestination.id === destination.id
                        ? "rgba(255,255,255,0.96)"
                        : "rgba(255,255,255,0.65)",

                border: "1px solid rgba(0,0,0,0.08)",

                borderRadius: "999px",

                fontSize: "0.72rem",

                letterSpacing: "0.08em",

                textTransform: "uppercase",

                color:
                    activeDestination.id === destination.id
                        ? "var(--fg)"
                        : "var(--fg-dim)",

                backdropFilter: "blur(10px)",

                boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
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

    transition: "transform 0.25s ease"
  }}

  onMouseEnter={(e) => {
    e.currentTarget.style.transform =
      "rotate(-45deg) scale(1.15)";
  }}

  onMouseLeave={(e) => {
    e.currentTarget.style.transform =
      "rotate(-45deg) scale(1)";
  }}
>
  {/* Inner Dot */}
  <div
    style={{
      position: "absolute",

      width: "6px",
      height: "6px",

      background: "white",

      borderRadius: "50%",

      top: "50%",
      left: "50%",

      transform: "translate(-50%, -50%)"
    }}
  />
</div>
          </div>
        ))}
      </div>
    </div>
  );
}