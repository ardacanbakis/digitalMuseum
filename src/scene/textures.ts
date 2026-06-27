import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from "three";

/**
 * Procedural surface textures generated at runtime with Canvas2D — keeps
 * the "no bundled assets" promise while giving the rooms marble, stone,
 * parquet etc. instead of flat colors. Each texture represents a ~4 m
 * patch and tiles via RepeatWrapping; callers set `.repeat` for the
 * surface size. Results are cached by key.
 */

export type FloorStyle =
  | "marble"
  | "checker"
  | "wood"
  | "concrete"
  | "travertine";

const SIZE = 512;
const cache = new Map<string, Texture>();

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Shift a hex color by `amt` (−255..255) and return an rgba() string. */
function shade(hex: string, amt: number, alpha = 1): string {
  const { r, g, b } = hexToRgb(hex);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
  return `rgba(${c(r)},${c(g)},${c(b)},${alpha})`;
}

function makeCanvas() {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  return { c, ctx: c.getContext("2d")! };
}

function grain(ctx: CanvasRenderingContext2D, amt: number) {
  const img = ctx.getImageData(0, 0, SIZE, SIZE);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() * 2 - 1) * amt;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function veins(
  ctx: CanvasRenderingContext2D,
  color: string,
  count: number,
  lineWidth: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    let x = Math.random() * SIZE;
    let y = Math.random() * SIZE;
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (Math.random() * 2 - 1) * SIZE * 0.45;
      y += (Math.random() * 2 - 1) * SIZE * 0.45;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function grout(ctx: CanvasRenderingContext2D, base: string, divisions: number) {
  ctx.strokeStyle = shade(base, -55, 0.7);
  ctx.lineWidth = 3;
  const step = SIZE / divisions;
  for (let i = 0; i <= divisions; i++) {
    const p = i * step;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, SIZE);
    ctx.moveTo(0, p);
    ctx.lineTo(SIZE, p);
    ctx.stroke();
  }
}

function drawMarble(ctx: CanvasRenderingContext2D, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  veins(ctx, shade(base, 45, 0.22), 14, 2);
  veins(ctx, shade(base, -35, 0.18), 10, 1.5);
  grain(ctx, 8);
  grout(ctx, base, 2); // 2×2 tiles → ~2 m each
}

function drawChecker(ctx: CanvasRenderingContext2D, base: string) {
  const dark = shade(base, -110);
  const half = SIZE / 2;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? base : dark;
      ctx.fillRect(c * half, r * half, half, half);
    }
  }
  veins(ctx, "rgba(255,255,255,0.10)", 16, 1.5);
  grain(ctx, 6);
  grout(ctx, base, 2);
}

function drawWood(ctx: CanvasRenderingContext2D, base: string) {
  const planks = 5;
  const h = SIZE / planks;
  for (let i = 0; i < planks; i++) {
    ctx.fillStyle = shade(base, (i % 2 === 0 ? 12 : -12) + (Math.random() * 10 - 5));
    ctx.fillRect(0, i * h, SIZE, h);
    // grain — faint horizontal strokes
    ctx.strokeStyle = shade(base, -25, 0.25);
    ctx.lineWidth = 1;
    for (let g = 0; g < 6; g++) {
      const y = i * h + Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(SIZE * 0.3, y + 2, SIZE * 0.6, y - 2, SIZE, y);
      ctx.stroke();
    }
    // plank seam
    ctx.strokeStyle = shade(base, -60, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, i * h);
    ctx.lineTo(SIZE, i * h);
    ctx.stroke();
    // staggered butt joint
    const jx = ((i % 2) * SIZE) / 2 + SIZE / 4;
    ctx.beginPath();
    ctx.moveTo(jx, i * h);
    ctx.lineTo(jx, (i + 1) * h);
    ctx.stroke();
  }
  grain(ctx, 6);
}

function drawConcrete(ctx: CanvasRenderingContext2D, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const rad = 40 + Math.random() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const tone = Math.random() > 0.5 ? 14 : -14;
    g.addColorStop(0, shade(base, tone, 0.18));
    g.addColorStop(1, shade(base, tone, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  grain(ctx, 10);
}

function drawTravertine(ctx: CanvasRenderingContext2D, base: string) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // horizontal striations
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    const y = Math.random() * SIZE;
    ctx.strokeStyle = shade(base, Math.random() > 0.5 ? 20 : -22, 0.16);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(SIZE * 0.3, y + 6, SIZE * 0.7, y - 6, SIZE, y);
    ctx.stroke();
  }
  grain(ctx, 8);
  grout(ctx, base, 2);
}

function finish(canvas: HTMLCanvasElement): Texture {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function floorTexture(style: FloorStyle, base: string): Texture {
  const key = `floor:${style}:${base}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { c, ctx } = makeCanvas();
  ({
    marble: drawMarble,
    checker: drawChecker,
    wood: drawWood,
    concrete: drawConcrete,
    travertine: drawTravertine,
  })[style](ctx, base);
  const tex = finish(c);
  cache.set(key, tex);
  return tex;
}

export function wallTexture(base: string): Texture {
  const key = `wall:${base}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { c, ctx } = makeCanvas();
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // soft vertical plaster streaks
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * SIZE;
    ctx.strokeStyle = shade(base, Math.random() > 0.5 ? 14 : -14, 0.08);
    ctx.lineWidth = 4 + Math.random() * 18;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() * 2 - 1) * 20, SIZE);
    ctx.stroke();
  }
  grain(ctx, 6);
  const tex = finish(c);
  cache.set(key, tex);
  return tex;
}

export function ceilingTexture(base: string): Texture {
  const key = `ceil:${base}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { c, ctx } = makeCanvas();
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SIZE, SIZE);
  grain(ctx, 5);
  // faint coffer grid
  ctx.strokeStyle = shade(base, -22, 0.5);
  ctx.lineWidth = 6;
  ctx.strokeRect(SIZE * 0.08, SIZE * 0.08, SIZE * 0.84, SIZE * 0.84);
  const tex = finish(c);
  cache.set(key, tex);
  return tex;
}
