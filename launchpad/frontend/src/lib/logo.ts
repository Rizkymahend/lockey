// Token logo checks. The logo link is written on-chain at launch and can never be changed,
// so it must be a link anyone can open: ipfs://… or a public https://… URL.
// Two earlier launches stored "http://localhost:3000/uploads/…", which only ever worked on the
// launcher's own computer, so the tokens show no image anywhere.

const GATEWAY = (process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/").replace(/\/?$/, "/");

/** Link you can put in an <img>: ipfs:// becomes a gateway URL. */
export function logoDisplayUrl(url: string): string {
  return url.startsWith("ipfs://") ? GATEWAY + url.slice("ipfs://".length) : url;
}

const PRIVATE_HOST = /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)|\.local$/i;

/** Returns why this logo link can't be used on-chain, or null when it's fine. */
export function logoProblem(url: string): string | null {
  const u = url.trim();
  if (!u) return "Add a token image first. The image is saved on-chain at launch and can't be added later.";
  if (u.startsWith("ipfs://")) return u.length > 12 ? null : "That IPFS link looks incomplete.";
  let parsed: URL;
  try { parsed = new URL(u); } catch { return "The image link must be a full link (ipfs://… or https://…), not a path on this site."; }
  if (PRIVATE_HOST.test(parsed.hostname)) {
    return "This image link only works on your own computer (localhost), so nobody else would see it. Upload to IPFS (set PINATA_JWT) or paste a public https:// image link.";
  }
  if (parsed.protocol !== "https:") return "Use an https:// or ipfs:// image link. Plain http links are blocked by most sites.";
  return null;
}

/** Tries to load the image from the public link (IPFS through the gateway). */
export function logoLoads(url: string, timeoutMs = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 0); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = logoDisplayUrl(url.trim());
  });
}

/** Full check before launch: rules first, then a real load test. Returns an error message or null. */
export async function checkLogoBeforeLaunch(url: string): Promise<string | null> {
  const problem = logoProblem(url);
  if (problem) return problem;
  if (!(await logoLoads(url))) return "The image link didn't load. Check that it opens in a private browser window, then try again.";
  return null;
}
