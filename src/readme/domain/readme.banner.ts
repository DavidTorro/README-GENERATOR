// Banner animado 100% vectorial, dibujado desde datos (patrón readme.mermaid.ts).
// Una SEMILLA por corrida abre el espacio de diseño (tono, tema claro/oscuro,
// layout); la IA decide motivo/densidad/tagline y la IA de imagen pinta el logo.
// Solo CSS dentro del SVG: GitHub lo anima aunque lo sirva como <img>

const W = 1280;
const H = 320;
const FONT = `'Helvetica Neue', -apple-system, 'Segoe UI', Arial, sans-serif`;

// Motivos de fondo que el renderer sabe dibujar
export type BannerMotif = "aurora" | "orbits" | "waves";
export const BANNER_MOTIFS: BannerMotif[] = ["aurora", "orbits", "waves"];

// Las DECISIONES de la IA (o defaultDesign sin IA)
export interface BannerDesign {
  motif: BannerMotif;
  density: "calm" | "lively"; // cantidad de decoración
  tagline?: string; // frase en el idioma pedido; si falta, la description
}

export interface BannerData {
  title: string;
  description: string; // fallback de la tagline
  design?: BannerDesign; // lo aporta la IA; ausente = defaultDesign
  logoPngBase64?: string; // logo generado por IA de imagen; sin él, iniciales
  seed?: number; // abre el espacio de diseño; sin semilla, hash (reproducible)
}

// Sin IA: aurora tranquila
export function defaultDesign(): BannerDesign {
  return { motif: "aurora", density: "calm" };
}

interface Palette {
  hue: number;
  bgA: string;
  bgB: string;
  ink: string; // texto principal (título)
  accent: string; // color protagonista
  accent2: string;
  accent3: string;
  soft: string; // decoración suave
  textSoft: string; // tagline
  pillFill: string; // fondo de las pastillas
  pillStroke: string;
  shadowColor: string;
  shadowOpacity: number;
  boost: number; // multiplica opacidades de los motivos (el tema oscuro pide más)
}

const hsl = (hue: number, s: number, l: number) =>
  `hsl(${((hue % 360) + 360) % 360}, ${s}%, ${l}%)`;

export function hashHue(text: string): number {
  let hash = 7;
  for (const ch of text) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) % 100_000;
  return hash % 360;
}

function makePalette(hue: number, theme: "light" | "dark"): Palette {
  if (theme === "dark") {
    return {
      hue,
      bgA: hsl(hue, 45, 8),
      bgB: hsl(hue + 40, 40, 13),
      ink: "#ffffff",
      accent: hsl(hue, 90, 62),
      accent2: hsl(hue + 45, 85, 64),
      accent3: hsl(hue - 45, 80, 60),
      soft: hsl(hue, 80, 70),
      textSoft: hsl(hue, 25, 82),
      pillFill: "rgba(255,255,255,0.08)",
      pillStroke: hsl(hue, 40, 32),
      shadowColor: "#000000",
      shadowOpacity: 0.35,
      boost: 2,
    };
  }
  return {
    hue,
    bgA: hsl(hue, 100, 99),
    bgB: hsl(hue + 30, 85, 94),
    ink: hsl(hue, 45, 12),
    accent: hsl(hue, 80, 50),
    accent2: hsl(hue + 45, 85, 60),
    accent3: hsl(hue - 45, 80, 62),
    soft: hsl(hue, 85, 72),
    textSoft: hsl(hue, 15, 40),
    pillFill: "#ffffff",
    pillStroke: hsl(hue, 30, 88),
    shadowColor: hsl(hue, 80, 50),
    shadowOpacity: 0.18,
    boost: 1,
  };
}

// Pseudoaleatorio CON semilla: misma semilla → mismo SVG (clave para tests)
function seededRand(seed: number): () => number {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
}

// SVG es XML: los datos del proyecto no pueden romper el documento
function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// "@davidtorro/readme-gen" → autor "davidtorro" + nombre corto "readme-gen"
function splitName(title: string): { author?: string; short: string } {
  const match = title.match(/^@([^/]+)\/(.+)$/);
  return match ? { author: match[1], short: match[2] ?? title } : { short: title };
}

// El ÚLTIMO tramo va en acento; sin separadores se parte por la mitad
function twoTone(short: string): [string, string] {
  const up = short.toUpperCase().replace(/[-_]/g, " ");
  const cut = up.search(/ [^ ]*$/);
  if (cut > 0) return [up.slice(0, cut), up.slice(cut)];
  const half = Math.ceil(up.length / 2);
  return [up.slice(0, half), up.slice(half)];
}

// La tagline entera en hasta 2 líneas (elipsis solo si ni así cabe)
function wrapTagline(text: string, maxChars = 84): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= 2) return lines;
  const second = lines[1] ?? "";
  return [lines[0] ?? "", `${second.slice(0, maxChars - 1).trimEnd()}…`];
}

// Puntitos de color suaves latiendo (decoración de fondo)
function dots(count: number, rand: () => number, p: Palette): string {
  let out = "";
  for (let i = 0; i < count; i++) {
    const cx = Math.round(40 + rand() * (W - 80));
    const cy = Math.round(30 + rand() * (H - 60));
    const r = (1.5 + rand() * 1.5).toFixed(1);
    out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.soft}" class="${i % 2 ? "dot-a" : "dot-b"}"/>`;
  }
  return out;
}

const CSS = `
      .fade-1 { opacity: 0; animation: fadeIn 1.1s ease 0.1s forwards; }
      .fade-2 { opacity: 0; animation: fadeIn 1.1s ease 0.4s forwards; }
      .dot-a { animation: breathe 5s ease-in-out infinite; }
      .dot-b { animation: breathe 7s ease-in-out 2s infinite; }
      .blob-a { animation: driftA 26s ease-in-out infinite; }
      .blob-b { animation: driftB 32s ease-in-out infinite; }
      .blob-c { animation: driftC 22s ease-in-out infinite; }
      .spin-a { animation: spin 16s linear infinite; }
      .spin-b { animation: spinRev 26s linear infinite; }
      .wave-a { animation: waveSlide 20s linear infinite; }
      .wave-b { animation: waveSlide 30s linear infinite reverse; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes breathe { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.5; } }
      @keyframes driftA { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(70px,30px) scale(1.12); } }
      @keyframes driftB { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-60px,-20px) scale(0.9); } }
      @keyframes driftC { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(40px,-35px); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes spinRev { to { transform: rotate(-360deg); } }
      @keyframes waveSlide { from { transform: translateX(0); } to { transform: translateX(-640px); } }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; opacity: 1 !important; }
      }`;

// ---- Motivos de fondo (capas detrás del texto) ----

function motifAurora(p: Palette, lively: boolean): string {
  const o = (v: number) => Math.min(v * p.boost, 0.45).toFixed(2);
  return [
    `<g filter="url(#blur)">`,
    `<circle cx="260" cy="70" r="180" fill="${p.accent}" opacity="${o(0.16)}" class="blob-a"/>`,
    `<circle cx="1030" cy="250" r="200" fill="${p.accent2}" opacity="${o(0.14)}" class="blob-b"/>`,
    `<circle cx="680" cy="10" r="150" fill="${p.accent3}" opacity="${o(0.12)}" class="blob-c"/>`,
    lively ? `<circle cx="420" cy="310" r="140" fill="${p.accent2}" opacity="${o(0.12)}" class="blob-b"/>` : "",
    `</g>`,
  ].filter(Boolean).join("\n  ");
}

function motifOrbits(p: Palette, lively: boolean): string {
  const o = (v: number) => Math.min(v * p.boost, 0.5).toFixed(2);
  const system = (cx: number, cy: number, scale: number) =>
    [
      `<g transform="translate(${cx} ${cy}) scale(${scale})">`,
      `<circle r="60" fill="none" stroke="${p.accent}" stroke-opacity="${o(0.22)}"/>`,
      `<circle r="98" fill="none" stroke="${p.accent}" stroke-opacity="${o(0.13)}"/>`,
      `<circle r="136" fill="none" stroke="${p.accent}" stroke-opacity="${o(0.07)}"/>`,
      `<g class="spin-a" style="transform-origin: 0px 0px"><circle cx="60" cy="0" r="5" fill="${p.accent}" fill-opacity="0.7"/></g>`,
      `<g class="spin-b" style="transform-origin: 0px 0px"><circle cx="-98" cy="0" r="4" fill="${p.accent2}" fill-opacity="0.7"/></g>`,
      `</g>`,
    ].join("");
  return system(1110, 265, 1) + (lively ? system(150, 55, 0.7) : "");
}

function motifWaves(p: Palette, lively: boolean): string {
  const o = (v: number) => Math.min(v * p.boost, 0.3).toFixed(2);
  // Onda periódica de 640px: al deslizar 640px el bucle es perfecto
  const wave = (y: number, amp: number, color: string, opacity: string, cls: string) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < W + 1280; x += 640) {
      d += ` q160 ${-amp} 320 0 t320 0`;
    }
    d += ` V${H} H0 Z`;
    return `<path d="${d}" fill="${color}" opacity="${opacity}" class="${cls}"/>`;
  };
  return [
    wave(245, 42, p.accent, o(0.10), "wave-a"),
    wave(262, 30, p.accent2, o(0.08), "wave-b"),
    lively ? wave(228, 54, p.accent3, o(0.06), "wave-a") : "",
  ].filter(Boolean).join("\n  ");
}

// ---- Piezas del layout ----

// Pastilla flotante con sombra suave (blanca en claro, cristal en oscuro)
function pill(x: number, y: number, width: number, p: Palette, content: string): string {
  return [
    `<g filter="url(#softShadow)">`,
    `<rect x="${x}" y="${y}" width="${width}" height="44" rx="22" fill="${p.pillFill}" stroke="${p.pillStroke}"/>`,
    `</g>`,
    content,
  ].join("\n  ");
}

export function buildBannerSvg(data: BannerData): string {
  const design = data.design ?? defaultDesign();

  // La semilla reparte el espacio de diseño: tono, tema y layout
  const rand = seededRand(data.seed ?? hashHue(data.title));
  const hue = Math.floor(rand() * 360);
  const theme: "light" | "dark" = rand() < 0.5 ? "light" : "dark";
  const layout: "center" | "left" = rand() < 0.5 ? "center" : "left";

  const p = makePalette(hue, theme);
  const { author, short } = splitName(data.title);
  const [dark, accent] = twoTone(short);
  // Iniciales para el mini-logo: "README GEN" → "RG"
  const initials = (dark.charAt(0) + (accent.trim().charAt(0) || dark.charAt(1))).toUpperCase();
  const lively = design.density === "lively";
  const centered = layout === "center";
  const tag = wrapTagline(design.tagline ?? data.description, centered ? 84 : 66);

  const motifSvg =
    design.motif === "orbits"
      ? motifOrbits(p, lively)
      : design.motif === "waves"
        ? motifWaves(p, lively)
        : motifAurora(p, lively);

  // Pastilla del logo: centrada arriba o arriba a la izquierda, según layout.
  // El chip (30px) se centra en la pastilla (44px): 40 + (44-30)/2 = 47
  const nameText = short
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const leftW = Math.round(nameText.length * 9.5) + 88;
  const leftX = centered ? Math.round((W - leftW) / 2) : 48;
  const chipInner = data.logoPngBase64
    ? `<image href="data:image/png;base64,${data.logoPngBase64}" x="${leftX + 14}" y="47" width="30" height="30" clip-path="url(#logoClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<text x="${leftX + 29}" y="67" text-anchor="middle" font-size="14" font-weight="800" fill="${p.ink}">${escapeXml(initials.charAt(0))}<tspan fill="${p.accent}">${escapeXml(initials.charAt(1))}</tspan></text>`;
  const leftPill = pill(
    leftX,
    40,
    leftW,
    p,
    [
      `<rect x="${leftX + 14}" y="47" width="30" height="30" rx="9" fill="${p.accent}" fill-opacity="0.12" stroke="${p.accent}" stroke-opacity="0.35"/>`,
      chipInner,
      `<text x="${leftX + 54}" y="67" font-size="16" font-weight="700" fill="${p.ink}">${escapeXml(nameText)}</text>`,
    ].join("\n  "),
  );

  // Pastilla derecha: autor (solo si el nombre lleva scope)
  const authorPill = author
    ? (() => {
        const text = `@${author}`;
        const width = Math.round(text.length * 9.5) + 44;
        const x = W - 48 - width;
        return pill(
          x,
          40,
          width,
          p,
          `<text x="${x + width / 2}" y="67" text-anchor="middle" font-size="16" font-weight="700" fill="${p.ink}">${escapeXml(text)}</text>`,
        );
      })()
    : "";

  // Título y tagline: centrados, o alineados a la izquierda
  const anchor = centered ? "middle" : "start";
  const textX = centered ? W / 2 : 64;
  const titleSize = centered ? 84 : 76;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">`,
    `  <defs>`,
    `    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">`,
    `      <stop offset="0" stop-color="${p.bgA}"/><stop offset="1" stop-color="${p.bgB}"/>`,
    `    </linearGradient>`,
    `    <filter id="blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="70"/></filter>`,
    `    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="180%">`,
    `      <feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="${p.shadowColor}" flood-opacity="${p.shadowOpacity}"/>`,
    `    </filter>`,
    `    <clipPath id="logoClip"><rect x="${leftX + 14}" y="47" width="30" height="30" rx="9"/></clipPath>`,
    `    <style>${CSS}</style>`,
    `  </defs>`,
    `  <rect width="${W}" height="${H}" fill="url(#bg)"/>`,
    `  ${motifSvg}`,
    `  <g>${dots(lively ? 16 : 8, rand, p)}</g>`,
    `  ${leftPill}`,
    `  ${authorPill}`,
    `  <g filter="url(#softShadow)" class="fade-1">`,
    `    <text x="${textX}" y="${tag.length > 0 ? 186 : 202}" text-anchor="${anchor}" font-size="${titleSize}" font-weight="800" letter-spacing="-3" fill="${p.ink}">${escapeXml(dark)}<tspan fill="${p.accent}">${escapeXml(accent)}</tspan></text>`,
    `  </g>`,
    ...tag.map(
      (line, i) =>
        `  <text x="${textX}" y="${232 + i * 27}" text-anchor="${anchor}" font-size="19" fill="${p.textSoft}" class="fade-2">${escapeXml(line)}</text>`,
    ),
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");
}