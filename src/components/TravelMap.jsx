import { useState } from "react";
import { travelDestinations } from "../data/travelDestinations";

export default function TravelMap() {

    const [activeDestination, setActiveDestination] = useState(
  travelDestinations[0]
);

  const handlePinClick = (id) => {

  const destination = travelDestinations.find(
    (d) => d.id === id
  );

  if (!destination) return;

  setActiveDestination(destination);

  setTimeout(() => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, 500);
};

  return (
    <div
      style={{
        position: "sticky",

        top: "var(--nav-h)",

        zIndex: 30,

        width: "100%",

        background: "var(--bg)",

        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <div
        style={{
          width: "100%",

          maxWidth: "700px",

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

            height: "40vh",

            objectFit: "contain",

            opacity: 0.92,

            display: "block"
          }}
        />

          {/* Airplane */}
<div
  style={{
    position: "absolute",

    left: activeDestination.mapPosition.x,
    top: activeDestination.mapPosition.y,

    transform: "translate(-50%, -50%)",

    fontSize: "1.2rem",

    color: "red",

    textShadow: "0 0 18px rgba(255,255,255,0.45)",

    transition:
      "left 0.8s cubic-bezier(0.22,1,0.36,1), top 0.8s cubic-bezier(0.22,1,0.36,1)",

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

                background: "rgba(255,255,255,0.92)",

                border: "1px solid rgba(0,0,0,0.08)",

                borderRadius: "999px",

                fontSize: "0.72rem",

                letterSpacing: "0.08em",

                textTransform: "uppercase",

                color: "var(--fg)",

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

    background: "#bf760d",

    borderRadius: "50% 50% 50% 0",

    transform: "rotate(-45deg)",

    boxShadow: "0 0 18px rgba(191,118,13,0.45)",

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