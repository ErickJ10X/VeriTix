# AGENTS.md

## Frontend styling rules

- Prefer standard Tailwind utility classes and Nuxt UI semantic tokens over arbitrary values.
- Do not introduce arbitrary values like `text-[...]`, `rounded-[...]`, `tracking-[...]`, `shadow-[...]`, or custom inline gradients if a standard Tailwind or Nuxt UI class can express the same intent.
- Reach first for:
  - Tailwind scale classes (`text-xs`, `rounded-2xl`, `shadow-lg`, `tracking-wide`, spacing scale, etc.)
  - Nuxt UI props (`color`, `variant`, `size`, `ui`)
  - Existing semantic tokens (`text-toned`, `border-default`, `bg-elevated`, etc.)
- Only use arbitrary values as a last resort when there is no suitable Tailwind/Nuxt UI alternative, and keep them isolated in reusable primitives instead of duplicating them inline.
