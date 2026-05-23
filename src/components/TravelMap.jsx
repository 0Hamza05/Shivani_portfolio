import { travelDestinations } from "../data/travelDestinations";

export default function TravelMap() {

  const handlePinClick = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
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

            height: "32vh",

            objectFit: "contain",

            opacity: 0.92,

            display: "block"
          }}
        />

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
            <button
              style={{
                width: "18px",
                height: "18px",

                borderRadius: "50%",

                border: "2px solid white",

                background: "#bf760d",

                boxShadow: "0 0 20px rgba(191,118,13,0.45)",

                cursor: "pointer",

                transition: "transform 0.25s ease"
              }}

              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)";
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}