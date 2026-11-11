// ETH/USD for the browser, fetched server side (exchange APIs are blocked on some networks) and cached 30 s.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cached: { at: number; price: number; source: string } | null = null;

async function from(url: string, pick: (j: any) => number) {
  const r = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!r.ok) throw new Error(String(r.status));
  const p = Number(pick(await r.json()));
  if (!(p > 0)) throw new Error("no price");
  return p;
}

export async function GET() {
  if (cached && Date.now() - cached.at < 30000) return NextResponse.json(cached);
  const sources: [string, string, (j: any) => number][] = [
    ["binance", "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT", (j) => j.price],
    ["coinbase", "https://api.coinbase.com/v2/prices/ETH-USD/spot", (j) => j.data?.amount],
    ["coingecko", "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", (j) => j.ethereum?.usd],
  ];
  for (const [source, url, pick] of sources) {
    try { cached = { at: Date.now(), price: await from(url, pick), source }; return NextResponse.json(cached); } catch { /* next source */ }
  }
  return cached ? NextResponse.json(cached) : NextResponse.json({ error: "no price source answered" }, { status: 502 });
}
