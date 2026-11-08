# UI Source: image

## Step 1: Image vs no image

**Image attached** → **Path A**.
**No image** → **Path B**.

---

## Path A: Pixel-perfect from image

The image was provided in chat (not a repo file); use the one in the conversation. Replicate it faithfully: the image is both the look and the composition, so match it, and do NOT embellish beyond it. The maximalist mandate is for the no-source path; here, fidelity to the reference governs. Tokenize what you see (values into the styling/theme system, character into `design.md`), and derive the responsive and accessible behavior a single screenshot cannot show (Phases 3 and 5). If the reference itself is a minimal screen, replicate it as given and note in the report that it is minimal.

### A0: Multiple images?

If more than one image, identify what each represents before analysis:
- **Same UI at different widths** → responsive breakpoints: extract layout changes per width, feed Phase 3
- **Same UI in different states** → default/hover/active/error: extract the visual diff per state, feed Phase 4
- **One light + one dark** → `colors:` from the light image, `colors-dark:` from the dark

Then run A1 on the primary (default/light) image.

### A1: Extract tokens from the image

Extract exactly what is visible, never fabricate values.
- **Colors**: canvas, surface(s), ink, body, muted, accent, accent-pressed, border, semantic colors; exact hex, not approximations
- **Typography**: family name if recognizable, size scale anchored to body = 16px, weights, line-heights, letter-spacing
- **Spacing**: 4px base unit; pad, gap, section rhythm, max-width
- **Geometry**: radius per element type, border widths, shadows (`x y blur spread color/opacity`), gradients, backdrop blur
- **Motion**: infer from context; micro-interactions (~100ms), standard (~200ms), reveals (~350ms), easing character
- **Mode**: light or dark, contrast level, sharpness

### A2: Tokens to CSS, character to design.md

Write the extracted token VALUES into the project's styling/theme system, the single source of truth, using `accent` (not `primary`) as the canonical accent name; include dark values if the design has or implies a dark mode. Record the visual character in `design.md` (art direction, per `ui/generate.md` B2's schema): `source: image`, a character summary, and the pointer to where the tokens live. Do not dump the token values into `design.md`.

### A3: Token file conflict check

Find existing token files. Conflicts between current values and the image: stop, list them before writing. Offer: `update` / `extend` / `skip`.

---
