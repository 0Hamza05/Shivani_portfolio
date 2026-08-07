// =============================================================
//  Parametric Name Keychain Generator
//  -----------------------------------------------------------
//  Just change `name` below (and the font if you like) and
//  render (F6) to get a keychain model for any name.
//  Export as STL for 3D printing.
// =============================================================

/* [Text] */
// The name to put on the keychain
name = "Nicole";
// Font family + style. Use any font installed on your system.
// Script fonts confirmed available on this PC:
//   "Script MT Bold"   <- bold rounded script (best match to ref)
//   "Segoe Script", "Brush Script MT", "Freestyle Script",
//   "French Script MT", "Lucida Handwriting", "Ink Free", "Gabriola"
// Safe fallback: "Liberation Sans:style=Bold"
font = "Pacifico";
// Text height in mm (cap height of the letters)
text_size = 18;
// Spacing between letters (1 = normal)
letter_spacing = 1;

/* [Sizes & Thicknesses] */
// Thickness of the colored base plate (mm)
base_thickness = 3;
// How far the letters stick out of the base (mm). For multi-color
// printing this is the second-color layer height.
text_raise = 1.2;
// Width of the colored border around the letters (mm)
border = 3;
// Roundness of the outline corners (higher = smoother bubble look)
roundness = 1.5;

/* [Key Ring] */
// Add the ring tab + hole
ring_enabled = true;
// Outer radius of the ring tab (mm)
ring_outer_r = 7;
// Radius of the hole for the split ring (mm)
ring_hole_r = 2.5;
// Fine-tune the ring position relative to the start of the name (mm).
// Positive x = right, positive y = up. Defaults work for any name.
ring_nudge_x = 0;
ring_nudge_y = 0;
// How far the ring's pink neck reaches INTO the letters (mm). Increase
// this to fill the gap next to tall first letters like "T" / "J".
ring_neck_reach = 9;
// Thickness of that neck as a fraction of the ring (0..1).
ring_neck_fill = 0.7;

/* [Quality] */
// Curve smoothness. Lower while editing (24), raise for final (64).
$fn = 48;

// -------------------------------------------------------------
//  Implementation
// -------------------------------------------------------------

module name_text(extra = 0) {
    // 2D outline of the name, optionally grown by `extra` mm.
    offset(r = extra)
        text(name,
             size = text_size,
             font = font,
             halign = "left",
             valign = "center",
             spacing = letter_spacing,
             $fn = $fn);
}

module base_outline() {
    // Bubble-style outline: grow the text, then round it.
    offset(r = roundness)
        offset(r = -roundness)
            name_text(extra = border);
}

// The text is left-aligned, so the name always STARTS at x=0 no
// matter how long it is. We anchor the ring to that fixed point and
// connect it with a hull "neck" that always fuses into the base, so
// the ring never drifts or detaches for different names.
module ring_tab() {
    // Ring centre: just left of the name start, at letter mid-height
    // (its original position). Nudge to taste.
    cx = -ring_outer_r * 0.5 + ring_nudge_x;
    cy = 0 + ring_nudge_y;

    linear_extrude(height = base_thickness)
        difference() {
            // A pink lozenge from the ring reaching INTO the letters.
            // The reach fills the gap beside tall first letters so the
            // ring blends into the plate instead of looking pinched.
            hull() {
                translate([cx, cy]) circle(r = ring_outer_r);
                translate([ring_neck_reach, cy])
                    circle(r = ring_outer_r * ring_neck_fill);
            }
            translate([cx, cy]) circle(r = ring_hole_r);
        }
}

module base_plate() {
    union() {
        linear_extrude(height = base_thickness)
            base_outline();
        if (ring_enabled) ring_tab();
    }
}

module raised_letters() {
    // Letters sitting on top of the base.
    translate([0, 0, base_thickness])
        linear_extrude(height = text_raise)
            name_text();
}

module keychain() {
    color("DeepPink")  base_plate();
    color("White")     raised_letters();
}

keychain();

// -------------------------------------------------------------
//  Multi-color / multi-part export helpers
//  Comment out keychain() above and uncomment ONE of these to
//  export each color as a separate STL, then assemble in slicer.
// -------------------------------------------------------------
// base_plate();        // -> export as base_<name>.stl  (pink)
// raised_letters();    // -> export as text_<name>.stl  (white)
