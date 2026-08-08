// Rasterizes the Logo component's `icon` variant (see src/components/Logo.tsx)
// into every favicon/PWA/app-icon asset the app actually references. Kept
// as a script rather than a one-off manual export so the icons stay
// reproducible if BRAND colors in Logo.tsx ever change.
//
// The SVG markup below is a hand-kept mirror of Logo.tsx's render output for
// variant="icon" — there's no React-to-static-SVG step in this repo, so it's
// duplicated rather than imported. If Logo.tsx's mark geometry changes, this
// needs updating too.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

const BRAND = {
  accent: "#C8860A",
  plate: "#0A1F10",
  surface: "#F5F1E8",
};

// Full (curved) streams — matches Logo.tsx's STREAMS_FULL, used at 24px+.
const STREAMS_FULL = [
  "M4 10C20 10 20 32 28 32",
  "M4 32H28",
  "M4 54C20 54 20 32 28 32",
];
// Compact (straight) streams — matches STREAMS_COMPACT, used below 24px
// where the curves lose definition (favicon's 16px tile).
const STREAMS_COMPACT = ["M9 15L26 29", "M9 32H26", "M9 49L26 35"];

function glyphPaths({ compact }) {
  const streams = compact ? STREAMS_COMPACT : STREAMS_FULL;
  const strokeWidth = compact ? 6.5 : 5;
  const hubX = compact ? 22 : 24;
  const tail = compact ? "M46 32H58" : "M48 32H60";
  return { streams, strokeWidth, hubX, tail };
}

function glyphGroup({ compact }) {
  const { streams, strokeWidth, hubX, tail } = glyphPaths({ compact });
  const strokedPaths = [...streams, tail]
    .map((d) => `<path d="${d}"/>`)
    .join("");
  return `<g stroke="${BRAND.accent}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">${strokedPaths}</g><rect x="${hubX}" y="20" width="24" height="24" rx="7" fill="${BRAND.surface}"/>`;
}

/** Standard icon tile: rounded plate, glyph fills the 64x64 box edge-to-edge (matches Logo variant="icon"). */
function iconSvg(size, { compact = size < 24, cornerRadius = 14 } = {}) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="${cornerRadius}" fill="${BRAND.plate}"/>${glyphGroup({ compact })}</svg>`;
}

/**
 * Maskable icon: OS launchers crop this to arbitrary shapes (circle, squircle,
 * ...), so per the maskable-icon spec, essential content must sit inside an
 * 80%-diameter "safe zone" circle centered on the tile. Background goes full
 * bleed with no rounded corners (the mask supplies the shape); the glyph is
 * shrunk ~28% and centered, giving comfortable margin beyond the spec minimum.
 */
function maskableSvg(size) {
  const scale = (size / 64) * 0.72;
  const translate = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="${BRAND.plate}"/><g transform="translate(${translate} ${translate}) scale(${scale}) translate(-32 -32)">${glyphGroup({ compact: false })}</g></svg>`;
}

async function pngBuffer(svg) {
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Minimal ICO container (Vista+ PNG-in-ICO format) — no npm package for this was in the tree. */
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);

  const entries = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const chunks = [header, entries];

  pngBuffers.forEach(({ size, buffer }, i) => {
    const entryOffset = i * 16;
    entries.writeUInt8(size >= 256 ? 0 : size, entryOffset + 0); // width
    entries.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1); // height
    entries.writeUInt8(0, entryOffset + 2); // color palette
    entries.writeUInt8(0, entryOffset + 3); // reserved
    entries.writeUInt16LE(1, entryOffset + 4); // color planes
    entries.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    entries.writeUInt32LE(buffer.length, entryOffset + 8); // image size
    entries.writeUInt32LE(offset, entryOffset + 12); // image offset
    offset += buffer.length;
    chunks.push(buffer);
  });

  return Buffer.concat(chunks);
}

async function main() {
  mkdirSync(path.join(publicDir, "icons"), { recursive: true });

  // favicon.ico — 16 (compact glyph), 32, 48 (full glyph)
  const icoSizes = [16, 32, 48];
  const icoPngs = await Promise.all(
    icoSizes.map(async (size) => ({ size, buffer: await pngBuffer(iconSvg(size)) })),
  );
  writeFileSync(path.join(root, "src", "app", "favicon.ico"), buildIco(icoPngs));
  console.log("[generate-icons] wrote src/app/favicon.ico");

  // apple-touch-icon.png — square, fully opaque: iOS applies its own
  // corner mask, and a pre-rounded/transparent source icon looks wrong
  // under it (Apple HIG).
  writeFileSync(
    path.join(publicDir, "apple-touch-icon.png"),
    await pngBuffer(iconSvg(180, { cornerRadius: 0 })),
  );
  console.log("[generate-icons] wrote public/apple-touch-icon.png");

  // PWA manifest icons
  writeFileSync(
    path.join(publicDir, "icons", "icon-192.png"),
    await pngBuffer(iconSvg(192)),
  );
  writeFileSync(
    path.join(publicDir, "icons", "icon-512.png"),
    await pngBuffer(iconSvg(512)),
  );
  writeFileSync(
    path.join(publicDir, "icons", "icon-512-maskable.png"),
    await pngBuffer(maskableSvg(512)),
  );
  console.log("[generate-icons] wrote public/icons/icon-{192,512,512-maskable}.png");
}

main();
