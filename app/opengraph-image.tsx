import { ImageResponse } from "next/og";
import { paths } from "@/content/paths";
import { lessons } from "@/content/lessons";

// Root-level `opengraph-image` is auto-detected by the App Router and wired
// into the site's <head> for every route — no metadata editing required.
// Docs: node_modules/next/dist/docs/.../metadata/opengraph-image.md

export const alt =
  "DevPath — Learn to code & grow your career, in plain words.";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

// The wayfinding "route" mark from app/icon.svg: a winding stroke from a small
// start node (bottom-left) up to a larger destination node (top-right).
function RouteGlyph({
  size: px,
  stroke,
  strokeWidth = 46,
  nodeFill,
  innerFill,
  opacity = 1,
}: {
  size: number;
  stroke: string;
  strokeWidth?: number;
  nodeFill: string;
  innerFill: string;
  opacity?: number;
}) {
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 512 512"
      fill="none"
      style={{ opacity }}
    >
      <path
        d="M156 356 C156 268 356 288 356 200 C356 150 312 132 264 132"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="156" cy="356" r="54" fill={nodeFill} />
      <circle cx="156" cy="356" r="22" fill={innerFill} />
      <circle cx="264" cy="132" r="66" fill={nodeFill} />
      <circle cx="264" cy="132" r="28" fill={innerFill} />
    </svg>
  );
}

export default function Image() {
  const pathCount = paths.length;
  const lessonCount = lessons.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          // Brand purple gradient (matches the site hero: #6f5cf5 → #5b4beb → #4263eb)
          backgroundColor: "#5b4beb",
          backgroundImage:
            "linear-gradient(135deg, #6f5cf5 0%, #5b4beb 52%, #4263eb 100%)",
          fontFamily: "Geist, sans-serif",
        }}
      >
        {/* Deep-purple glow (matches --color-primary companion #5F3DC4) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(900px 620px at 88% 118%, rgba(95,61,196,0.75) 0%, rgba(95,61,196,0) 60%), radial-gradient(700px 520px at 6% -12%, rgba(124,108,255,0.55) 0%, rgba(124,108,255,0) 62%)",
          }}
        />

        {/* Subtle dotted texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.10) 1.6px, transparent 1.7px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Oversized route glyph as a background wayfinding motif */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 44,
            right: -70,
          }}
        >
          <RouteGlyph
            size={560}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={40}
            nodeFill="rgba(255,255,255,0.16)"
            innerFill="rgba(255,255,255,0.04)"
          />
        </div>

        {/* Foreground content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "80px 84px",
          }}
        >
          {/* Brand lockup: purple tile with the white route mark */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                boxShadow: "0 12px 40px rgba(23,10,74,0.35)",
              }}
            >
              <RouteGlyph
                size={104}
                stroke="#5b4beb"
                strokeWidth={46}
                nodeFill="#5b4beb"
                innerFill="#ffffff"
              />
            </div>
            <div
              style={{
                marginLeft: 26,
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: 6,
                color: "rgba(255,255,255,0.82)",
                textTransform: "uppercase",
              }}
            >
              DevPath
            </div>
          </div>

          {/* Headline + tagline */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 148,
                fontWeight: 800,
                letterSpacing: -4,
                lineHeight: 1,
                color: "#ffffff",
              }}
            >
              DevPath
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 46,
                fontWeight: 500,
                lineHeight: 1.2,
                maxWidth: 880,
                color: "rgba(255,255,255,0.90)",
              }}
            >
              Learn to code &amp; grow your career — in plain words.
            </div>
          </div>

          {/* Footer stats chip */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 30px",
                borderRadius: 999,
                fontSize: 30,
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              {pathCount} learning paths · {lessonCount} lessons
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
