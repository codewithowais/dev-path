// Accent-colour helpers for WCAG AA contrast.
//
// The per-item brand hexes (pillar / path / role colours) are vivid but too
// light to use as text, or under white text, at the small sizes we render them.
// These helpers deepen a hex toward ink while keeping its hue, so colour-coded
// text and solid fills stay legible. Bright raw hues are still used for the
// large gradient icon tiles and hover washes, where contrast isn't an issue.

/** Deepened accent for COLOURED TEXT / icons on white or a light tint. AA on white. */
export const accentText = (c: string): string =>
  `color-mix(in srgb, ${c} 55%, #16182e)`;

/** Deepened accent for a SOLID FILL that carries white text/icons. White passes AA. */
export const accentFill = (c: string): string =>
  `color-mix(in srgb, ${c} 60%, #16182e)`;

/** A very light tint of the accent — card washes, badge backgrounds behind
 *  accentText(). Pair a tint background with accentText() foreground. */
export const accentTint = (c: string, pct = 12): string =>
  `color-mix(in srgb, ${c} ${pct}%, white)`;
