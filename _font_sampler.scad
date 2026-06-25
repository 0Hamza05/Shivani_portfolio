// Temporary font comparison sheet
fonts = [
    "Segoe Script",
    "Brush Script MT",
    "Freestyle Script",
    "French Script MT",
    "Script MT Bold",
    "Gabriola",
    "Ink Free",
    "Lucida Handwriting",
];

name = "Nicole";
$fn = 32;

for (i = [0 : len(fonts)-1])
    translate([0, -i * 26, 0])
        union() {
            // small label of the font name in a plain font
            translate([-120, 0, 0])
                text(fonts[i], size = 6, font = "Liberation Sans",
                     halign = "right", valign = "center");
            // the sample
            translate([-110, 0, 0])
                text(name, size = 18, font = fonts[i],
                     halign = "left", valign = "center");
        }
