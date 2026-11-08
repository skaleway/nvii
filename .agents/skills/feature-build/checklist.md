# UI Accessibility and Token Checklist

Loaded by /feature-build (UI track) during Phase 5. Work through each section. Items marked **required** must pass before the skill is complete. Best effort items should be completed where scope allows. The requirements are the same on every platform; build them with the platform's own semantic primitives and accessibility API (on web that is semantic HTML plus ARIA; mobile toolkits expose the same ideas their own way).

---

## Operable without a pointer (required)

- [ ] Every interactive element is reachable and operable without a pointer (keyboard on web/desktop, the platform's assistive navigation on mobile), in reading order
- [ ] Primary activation and dismissal work (activate a control, dismiss/close an overlay)
- [ ] Composite widgets (tabs, listboxes, menus, radio groups) are navigable per the platform's guidance for that pattern
- [ ] No focus trap except inside a modal/dialog, where a trap is required
- [ ] After an action removes the focused element, focus moves to a logical next target, never lost

## Focus visibility (required)

- [ ] Every focusable element has a visible focus indicator in all states
- [ ] A default focus indicator is never removed without a custom one replacing it
- [ ] The focus indicator is visually distinct: clearly thick and at least 3:1 contrast against adjacent colour

## Semantic structure (required)

- [ ] Headings/sections reflect content hierarchy, never chosen for visual size, and never skip a level
- [ ] Actions use the platform's real action primitive; navigation uses its real navigation primitive; never a styled generic container faking one
- [ ] Repeated item sets, tabular data, and landmark regions use the platform's real list, table, and landmark primitives, not generic containers
- [ ] Related form fields are grouped the platform's way

## Labels and accessible names (required)

- [ ] Every input control has an associated, persistent label (a placeholder is not the only label)
- [ ] Icon only controls carry an accessible name describing the action (e.g. "Close")
- [ ] Meaningful images carry a description of content and purpose (not the filename, not "image of"); a linked image describes its destination
- [ ] Decorative images and icons are hidden from assistive tech

## Name, role, state (use the accessibility API only where native semantics fall short)

- [ ] Genuinely custom widgets expose their role
- [ ] Toggle/disclosure controls expose their expanded/collapsed state and, where supported, what they control
- [ ] Regions that update dynamically announce through the platform's live region mechanism, at the right urgency (alert for errors, status for non urgent)
- [ ] Controls that are disabled, required, or invalid expose that state, and an invalid field is tied to its error message
- [ ] Elements that only add noise for assistive tech (decorative, or duplicating visible text) are hidden from it

## Colour contrast (required)

- [ ] Normal text (< 18pt / < 14pt bold): contrast ratio ≥ 4.5:1 against background
- [ ] Large text (≥ 18pt / ≥ 14pt bold): contrast ratio ≥ 3:1 against background
- [ ] Control boundaries (input borders, button outlines, focus indicators): ≥ 3:1 against adjacent colours
- [ ] Placeholder text: technically exempt but aim for ≥ 4.5:1 for usability
- [ ] Information is never conveyed by colour alone, always paired with text, icon, or shape

## Modal and dialog (required when applicable)

- [ ] The overlay exposes its dialog role and an accessible name (its visible title), and a description if present
- [ ] Focus moves into the overlay when it opens, to the first control or the dialog itself
- [ ] Focus is trapped inside while open
- [ ] It can be dismissed the platform's way (e.g. Escape on web)
- [ ] Focus returns to the trigger that opened it on close

## Token discipline (required)

- [ ] No raw colour literals in new files
- [ ] No raw size values for spacing, padding, margin, gap, font size, line height, radius, or shadow that duplicate a token (exception: a genuine one off constant)
- [ ] All values reference the design system's tokens
- [ ] A missing token is documented as `// TODO: missing token: <what's needed>`, not invented inline

## Responsive (best effort verification)

- [ ] No unintended overflow at the smallest supported screen width
- [ ] Touch targets ≥ 44 by 44 at that size
- [ ] Body copy readable (about 16px equivalent) at that size
- [ ] Images do not overflow their container
- [ ] Data heavy content has a small screen strategy (scroll, card layout, etc.)

## Loading and error states (required)

- [ ] Loading state is implemented, no blank space while data loads
- [ ] Error state is implemented, message is visible and actionable
- [ ] Empty state is implemented, message explains why and what to do
- [ ] States are visually distinct from each other and from the populated state
