// Twitter/X share card — reuse the site-wide Open Graph image exactly.
// Re-exporting the default function plus its config (`alt`, `size`,
// `contentType`) lets the App Router auto-wire the same generated image into
// the `twitter:image` tags with no duplicated design code.
export { default, alt, size, contentType } from "./opengraph-image";
