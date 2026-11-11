// Same-origin JSON-RPC proxy for the browser. Some networks block or intercept the official Robinhood Chain RPC,
// so the page talks to /api/rpc and the server reaches the RPC by its Cloudflare IP with the right SNI,
// falling back to publicnode (which serves everything except eth_getLogs). Read-only methods only.
import https from "node:https";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOST = "rpc.mainnet.chain.robinhood.com";
const MIRROR = "robinhood-rpc.publicnode.com";
const READ = new Set([
  "eth_chainId", "net_version", "eth_blockNumber", "eth_call", "eth_estimateGas", "eth_gasPrice", "eth_maxPriorityFeePerGas",
  "eth_feeHistory", "eth_getBalance", "eth_getCode", "eth_getStorageAt", "eth_getTransactionCount", "eth_getLogs",
  "eth_getBlockByNumber", "eth_getBlockByHash", "eth_getTransactionByHash", "eth_getTransactionReceipt", "web3_clientVersion",
]);

let ip = "104.20.46.209";
let ipAt = 0;
async function officialIp() {
  if (Date.now() - ipAt > 3600e3) {
    ipAt = Date.now();
    try {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${HOST}&type=A`, { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(4000) });
      const j = await r.json();
      ip = j.Answer?.find((a: { type: number; data: string }) => a.type === 1)?.data || ip;
    } catch { /* keep the last known address */ }
  }
  return ip;
}

function post(addr: string, servername: string, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request({ host: addr, servername, port: 443, path: "/", method: "POST", timeout: 20000,
      headers: { host: servername, "content-type": "application/json", "content-length": Buffer.byteLength(body) } }, (res) => {
      const parts: Buffer[] = [];
      res.on("data", (d) => parts.push(d));
      res.on("end", () => (res.statusCode && res.statusCode < 500 ? resolve(Buffer.concat(parts).toString()) : reject(new Error(`upstream ${res.statusCode}`))));
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", reject);
    req.end(body);
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (body.length > 250_000) return NextResponse.json({ error: "request too large" }, { status: 413 });
  let calls: { method?: string }[];
  try { const j = JSON.parse(body); calls = Array.isArray(j) ? j : [j]; } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (!calls.length || calls.length > 50 || calls.some((c) => !READ.has(String(c?.method)))) {
    return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32601, message: "method not allowed on this proxy" } }, { status: 403 });
  }
  const needsLogs = calls.some((c) => c.method === "eth_getLogs");
  const tries: [string, string][] = [[await officialIp(), HOST], [await officialIp(), HOST]];
  if (!needsLogs) tries.push([MIRROR, MIRROR]);
  let last: unknown;
  for (const [i, [addr, name]] of tries.entries()) {
    try {
      const text = await post(addr, name, body);
      // the official RPC rate-limits bursts: wait a moment and try the next route instead of passing the 429 on
      if (/"code":\s*429|Too Many Requests/.test(text) && i < tries.length - 1) { last = new Error("rate limited"); await new Promise((r) => setTimeout(r, 700 * (i + 1))); continue; }
      return new NextResponse(text, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
    } catch (e) { last = e; }
  }
  return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32000, message: `chain unreachable: ${String((last as Error)?.message || last)}` } }, { status: 502 });
}
