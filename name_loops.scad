// =============================================================
//  Name Keychain - NAME ONLY + a loop on each side
//  -----------------------------------------------------------
//  No background plate. The cursive name itself is the solid
//  part, with a ring loop attached at the left and right ends.
//  Change `name` and render (F6), then export STL.
// =============================================================

/* [Text] */
// The name to put on the keychain
name = "Hamza";
// Font (must be installed / on OPENSCAD_FONT_PATH). Use a CONNECTED
// script like "Pacifico" so the letters join into one solid piece.
font = "Pacifico";
// Text height in mm
text_size = 20;
// Spacing between letters (1 = normal)
letter_spacing = 1;

/* [Solid & Printability] */
// Total thickness of the part (mm)
thickness = 4;
// Thicken the strokes so thin script survives printing AND so
// neighbouring letters merge into one connected body (mm).
bolden = 0.7;
// Round the merges/corners for a smooth look (mm)
smooth = 0.8;

/* [Loops] */
// Outer radius of each ring loop (mm)
loop_outer_r = 6;
// Hole radius for the split ring (mm)
loop_hole_r = 2.5;
// Thickness of the thin link that joins each loop to the name (mm).
// Kept slim so it reads as a connector, never a blob on the letters.
neck_width = 4;
// RIGHT loop position = where the name ENDS, in mm from the start.
// The loop sits just past this x with a small, clean connector.
//   <number> -> exact end position (tuned "84" fits "Hamza")
//   "auto"   -> rough guess from name length (then nudge to taste)
// For a NEW name: watch the preview and raise this if the loop buries
// into the letters, lower it if there is a gap before the loop.
right_loop_x = 83;
// Fine nudges [x, y] in mm if a loop needs a small adjustment.
left_loop_nudge  = [0, 0];
right_loop_nudge = [0, 0];

/* [Quality] */
// Curve smoothness (raise to 64 for final render/export)
$fn = 48;

// -------------------------------------------------------------
//  Implementation
// -------------------------------------------------------------

// Average glyph advance as a fraction of text_size (calibrated for
// Pacifico). Names vary, so `right_loop_x` lets you override.
width_factor = 0.78;
auto_w = len(name) * text_size * width_factor;
rx = (right_loop_x == "auto") ? auto_w : right_loop_x;

module name_2d() {
    // Bolden then round -> a solid, printable, connected outline.
    // Left-aligned so the name always STARTS at x = 0.
    offset(r = smooth) offset(r = -smooth)
        offset(delta = bolden)
            text(name,
                 size = text_size,
                 font = font,
                 halign = "left",
                 valign = "center",
                 spacing = letter_spacing,
                 $fn = $fn);
}

// A ring loop connected to the name by a hull "neck". Because the
// neck's anchor point is guaranteed to sit INSIDE the name, the loop
// is always fused to the body no matter where its centre lands.
module loop_2d(center, anchor, nudge) {
    c = center + nudge;
    difference() {
        union() {
            translate(c) circle(r = loop_outer_r);        // ring body
            hull() {                                       // slim link
                translate(c)      square(neck_width, center = true);
                translate(anchor) square(neck_width, center = true);
            }
        }
        translate(c) circle(r = loop_hole_r);
    }
}

module part_2d() {
    union() {
        name_2d();
        // Left loop: fully before the start (x = 0), joined by a slim
        // link whose inner end tucks 2 mm into the first letter.
        loop_2d([-(loop_outer_r + 1), 0],
                [2, 0],
                left_loop_nudge);
        // Right loop: fully past the name end (rx), joined by a slim
        // link whose inner end tucks 2 mm into the last letter. The loop
        // itself clears the letter, so it never merges into it.
        loop_2d([rx + loop_outer_r + 1, 0],
                [rx - 2, 0],
                right_loop_nudge);
    }
}

linear_extrude(height = thickness)
    part_2d();
