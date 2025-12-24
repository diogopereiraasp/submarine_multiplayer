export function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return null;

  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return null;

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function mixWithWhite({ r, g, b }, t) {
  return {
    r: Math.round(r + (255 - r) * t),
    g: Math.round(g + (255 - g) * t),
    b: Math.round(b + (255 - b) * t),
  };
}
