# ACKO Health Insurance Prototype — Design & Content Rules

## Visual Icon Policy

**Use custom SVG icons instead of emojis throughout the prototype.**

SVG icon system:
- All icons are defined in `ChatWidgets.tsx` via the `ICON_PATHS` record and rendered by the `OptionIcon` component
- Icons use `stroke="currentColor"` with `strokeWidth={1.5}` for consistency
- Default icon color is `text-purple-600` to match the ACKO brand
- Landing page and entry screen have dedicated inline SVG icon components
- Each selection card, widget, and UI element uses SVG icons — never emoji characters

When adding new icons:
- Add the SVG path to the `ICON_PATHS` record in `ChatWidgets.tsx`
- Use Heroicons-style 24x24 viewBox, stroke-based paths
- Reference the icon by its string key (e.g., 'search', 'user', 'building') in scripts
- The `OptionIcon` component handles rendering and fallback

Do NOT use emojis anywhere in the codebase — use SVG icons for all visual elements.

## Design Language

Follow the ACKO design system:
- **Primary color**: Purple (#522ED5 / purple-600)
- **Neutral palette**: Onyx scale (200-900)
- **Font**: Euclid Circular B (loaded via CDN)
- **Radius**: Rounded corners (xl/2xl for cards, full for pills)
- **Motion**: Framer Motion with ease-out curves, 200-400ms durations
- **Glass effect**: backdrop-blur for sticky headers

## Content Tone

- Human, warm, and transparent
- Persona-specific language (6 defined personas)
- Address users by name throughout the conversation
- For existing ACKO users, use "Rahul" as the default name
- No jargon without explanation
- No sales pressure — confidence through clarity

## Component Guidelines

- All interactive elements must have active/pressed states (scale 0.97)
- All animations should respect reduced-motion preferences
- Selection states use purple-600 border + purple-100 background
- Disabled states use opacity-40
