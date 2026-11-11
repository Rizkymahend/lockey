"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  AlertTriangle,
  Rocket,
  TrendingUp,
  Coins,
  Flame,
  Wallet,
  Lock,
  Sparkles,
  BarChart2,
} from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/config/chain";

interface CodeBlockProps {
  caption: string;
  code: string;
}

function CodeSnippet({ caption, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden my-4 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/90">
        <span className="text-[11px] font-mono text-yellow-400 font-semibold flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-yellow-400" />
          <span>{caption}</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-[11px] text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-mono transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto bg-black/60">
        <pre className="font-mono text-xs text-zinc-200 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function FormulaBox({ title, formula }: { title: string; formula: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl my-3 text-xs font-mono gap-2">
      <span className="text-zinc-300 font-medium">{title}</span>
      <code className="text-yellow-400 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px]">
        {formula}
      </code>
    </div>
  );
}

export default function DocsPage() {
  const [copiedContract, setCopiedContract] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(key);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  const navGroups = [
    {
      label: "Narrative & Protocol Mechanics",
      items: [
        { id: "radar-narrative", label: "0. Live X Narrative Radar & Fast Launch" },
        { id: "overview", label: "1. Protocol Overview" },
        { id: "how-it-works", label: "2. How It Works (Step-by-Step)" },
        { id: "launches", label: "3. Token Launch Mechanism" },
        { id: "trading", label: "4. Trading & Bonding Curve" },
        { id: "anti-snipe", label: "5. Anti-Snipe (99% Bot Decay)" },
        { id: "graduation", label: "6. Uniswap v4 Graduation" },
        { id: "fees", label: "7. Fees & Creator Royalties" },
        { id: "creator-guide", label: "8. Creator Dashboard" },
        { id: "cto", label: "9. Community Takeovers (CTO)" },
        { id: "risks", label: "10. Risk Disclosures" },
      ],
    },
    {
      label: "Developer & Onchain API",
      items: [
        { id: "network", label: "Robinhood Chain Specs" },
        { id: "contracts", label: "Smart Contract Addresses" },
        { id: "events", label: "Onchain Event Logs" },
        { id: "state", label: "Reading Token State" },
        { id: "pricing-code", label: "Pricing & Graduation Math" },
        { id: "trade-code", label: "Execute Trades (Viem)" },
        { id: "fee-code", label: "Claim Creator Royalties" },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">
      {/* Hero Banner */}
      <div className="relative p-8 sm:p-12 overflow-hidden bg-[#121318] border border-zinc-800 rounded-2xl shadow-sm">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-yellow-400/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-pulse"></span>
            <span>Official LOCKEY Documentation • Robinhood Chain ID 4663</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            How It Works &amp; Protocol Reference <span className="text-yellow-400">LOCKEY</span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-sans">
            Complete guide to the LOCKEY token launchpad ecosystem powered by Pons v2 on Robinhood Chain: fair-launch token deployment with 0.0005 ETH launch fee, constant-product bonding curves, automated Uniswap v4 graduation (Zero-Rug Guarantee), creator royalties, and developer smart contract integration.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
              Gas Asset: <strong className="text-yellow-400">Native ETH</strong>
            </span>
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
              Total Supply: <strong className="text-yellow-400">1,000,000,000 Fixed</strong>
            </span>
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
              Graduation Target: <strong className="text-yellow-300">4.2 ETH</strong>
            </span>
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
              LP Liquidity: <strong className="text-zinc-100">Automated Uniswap v4 Migration</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
          <div className="p-5 space-y-5 bg-[#121318] border border-zinc-800 rounded-2xl shadow-sm">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <p className="text-[10px] font-mono tracking-widest uppercase text-yellow-400 font-bold px-2.5 py-1">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-yellow-400 hover:bg-zinc-900 transition font-medium"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="pt-4 border-t border-zinc-800 text-[11px] font-mono space-y-1.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Network</span>
                <span className="text-zinc-200 font-semibold">Robinhood Chain</span>
              </div>
              <div className="flex justify-between">
                <span>Chain ID</span>
                <span className="text-yellow-400 font-semibold">4663</span>
              </div>
              <div className="flex justify-between">
                <span>Gas Asset</span>
                <span className="text-yellow-400 font-semibold">Native ETH</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Column */}
        <div className="lg:col-span-9 space-y-16">
          {/* =========================================================================
              PART 1: PROTOCOL & HOW IT WORKS (COMPLETE GUIDE)
             ========================================================================= */}

          {/* 0. LIVE X NARRATIVE RADAR */}
          <section id="radar-narrative" className="scroll-mt-24 space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-mono font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Flagship Live Feed Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Live X Narrative Radar &amp; Instant Fast Launch
              </h2>
              <p className="text-xs text-zinc-400">
                Real-time Twitter/X alpha detection, automatic narrative token extraction, and sub-second Robinhood Chain deployment
              </p>
            </div>

            <div className="text-sm text-zinc-300 leading-relaxed space-y-4">
              <p>
                The <strong>LOCKEY Live Narrative Radar</strong> continuously tracks influential crypto accounts and trending viral discussions directly from Twitter/X. Instead of waiting hours for copycat tokens to be manually created, LOCKEY parses emerging crypto narratives the second they break and offers an instant <strong>Fast Launch</strong> flow.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-xs">
                    01
                  </div>
                  <strong className="text-white block text-sm">Real-Time Ingestion</strong>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Live stream feeds incoming tweets from top crypto leaders, showing user verification status, follower count, media, and exact publication time.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-xs">
                    02
                  </div>
                  <strong className="text-white block text-sm">Automated Ticker Parsing</strong>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Our narrative engine automatically parses tweet context to suggest relevant token names and ticker symbols ($TICKER) for immediate community consensus.
                  </p>
                </div>

                <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-xs">
                    03
                  </div>
                  <strong className="text-white block text-sm">1-Click Fast Launch</strong>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Auto-populates media images as token logo, formats tweet quote descriptions with source attribution, and sets the official website URL directly to the tweet post.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-zinc-900/80 border border-yellow-500/20 rounded-xl text-xs space-y-2">
                <span className="font-bold text-yellow-400 flex items-center space-x-2 text-sm">
                  <Rocket className="w-4 h-4" />
                  <span>Instant Narrative Token Dynamics</span>
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
                  <li><strong>0.0005 ETH Launch Fee:</strong> Affordable, anti-spam deployment fee paid to Robinhood Chain Pons v2 factory.</li>
                  <li><strong>Post Link as Official Website:</strong> Every token launched from a tweet automatically links to the authentic tweet URL on the token explorer page, preserving provenance.</li>
                  <li><strong>Zero 5-Year Lockups:</strong> Tokens launched through LOCKEY have no forced 5-year vesting or lockup mechanisms, ensuring 100% fair and dynamic community market-making.</li>
                  <li><strong>Instant Snipe Protection:</strong> 5-second 99% decaying anti-snipe tax shields human traders from automated MEV bots upon launch.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 1. OVERVIEW */}
          <section id="overview" className="scroll-mt-24 space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-black text-white">1. Protocol Overview</h2>
              <p className="text-xs text-slate-400">Non-custodial token launch and decentralized trading protocol on Robinhood Chain</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                <strong>LOCKEY</strong> is a next-generation fair-launch token protocol built natively on <strong>Robinhood Chain (Chain ID: 4663)</strong>. It is designed to solve classic problems found in conventional Web3 launchpads: steep initial liquidity capital requirements, developer rug-pull risks, sniper bot exploitation, and high gas fees.
              </p>
              <p>
                LOCKEY operates in a strictly <em>non-custodial</em> manner — the platform never holds user private keys or custodial funds. Every token creation, swap transaction, and creator royalty claim is executed directly onchain by Robinhood Chain smart contracts through explicit cryptographic signatures from your Web3 wallet (OKX Wallet, MetaMask, Rabby, etc.).
              </p>

              <div className="p-5 clay-surface text-xs space-y-2.5">
                <span className="font-bold text-yellow-400 flex items-center space-x-2 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Key Architectural Guarantees</span>
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                  <li><strong>Native ETH Gas:</strong> Robinhood Chain utilizes native ETH for gas fees, ensuring fractional transaction costs with zero need for volatile gas bridging.</li>
                  <li><strong>Fixed Supply (Zero Post-Deployment Minting):</strong> Every token has a fixed supply of exactly 1,000,000,000 tokens (18 decimals). There is no backdoor mint function to dilute token holders.</li>
                  <li><strong>Permanently Locked Liquidity (Zero-Rug Guarantee):</strong> Upon reaching the 4.2 ETH graduation threshold, all liquidity is paired into Uniswap v4 and locked permanently in the Launch Locker contract.</li>
                  <li><strong>Transparent & Deterministic AMM Pricing:</strong> Token pricing is calculated mathematically using constant-product virtual reserves (x * y = k).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. HOW IT WORKS (STEP-BY-STEP) */}
          <section id="how-it-works" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h2 className="text-2xl font-black text-white">How LOCKEY Works (Step-by-Step)</h2>
              <p className="text-xs text-slate-400">End-to-end token lifecycle from creation to DEX liquidity graduation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-5 clay-surface space-y-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-mono font-bold">
                  01
                </div>
                <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-yellow-400" />
                  <span>Connect Web3 Wallet</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect your Web3 wallet (OKX Wallet, MetaMask, or Rabby) to Robinhood Chain (Chain ID: 4663). Ensure you have native ETH for gas fees and trading capital.
                </p>
              </div>

              <div className="p-5 clay-surface space-y-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-mono font-bold">
                  02
                </div>
                <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                  <Rocket className="w-4 h-4 text-yellow-400" />
                  <span>Launch Token Instantly (/create)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide token name, ticker, description, IPFS logo, and set creator royalty (1% – 5%). The factory atomically mints 1B tokens (80% to curve, 20% to DEX escrow) and immediately redirects you to the live trading page.
                </p>
              </div>

              <div className="p-5 clay-surface space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold">
                  03
                </div>
                <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Bonding Curve Trading</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The public can immediately buy and sell tokens using native ETH. Each swap shifts the spot price algorithmically according to x * y = k with zero initial liquidity funding required.
                </p>
              </div>

              <div className="p-5 clay-surface space-y-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold">
                  04
                </div>
                <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>5-Second Anti-Snipe Protection</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In block 0 (first second), sniper bots face a 99% penalty tax paid directly to protocol reserves. The tax rapidly decays to 0% within 5 seconds, shielding human retail traders from MEV exploitation.
                </p>
              </div>

              <div className="p-5 clay-surface space-y-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-mono font-bold">
                  05
                </div>
                <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>DEX Graduation &amp; Permanent LP Lock</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon reaching the 4.2 ETH liquidity target, curve trading concludes. Accumulated ETH and 200M reserved tokens are seeded into Uniswap v4, and the LP position is permanently locked in Launch Locker (Zero-Rug Guarantee).
                </p>
              </div>

              <div className="p-5 clay-surface space-y-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono font-bold">
                  06
                </div>
                <h3 className="text-white font-bold text-sm flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-sky-400" />
                  <span>Creator Royalties &amp; Instant Claims</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Creators earn 0% - 5% on every curve trade. ETH royalties collect on the bonding curve; sweep them into the Fee Escrow from the Creator Dashboard, then claim anytime.
                </p>
              </div>
            </div>
          </section>

          {/* 3. HOW LAUNCHES WORK */}
          <section id="launches" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h2 className="text-2xl font-black text-white">3. Token Launch Mechanism</h2>
              <p className="text-xs text-slate-400">Atomic creation of fixed-supply tokens and AMM bonding curve pools</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                To launch a new token, navigate to the <strong>Create Token</strong> page (<Link href="/create" className="text-sky-400 hover:underline">/create</Link>). Specify the following project metadata:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 clay-surface space-y-1">
                  <strong className="text-white block text-sm">Token Name & Symbol</strong>
                  <span className="text-slate-400">Full project title and concise ticker (e.g., RobinMoon / MOON).</span>
                </div>
                <div className="p-4 clay-surface space-y-1">
                  <strong className="text-white block text-sm">Token Logo (IPFS)</strong>
                  <span className="text-slate-400">Decentralized asset hosting uploaded automatically via Pinata IPFS.</span>
                </div>
                <div className="p-4 clay-surface space-y-1">
                  <strong className="text-white block text-sm">Description & Social Links</strong>
                  <span className="text-slate-400">Project story, official X / Twitter, Telegram, and Website URLs.</span>
                </div>
                <div className="p-4 clay-surface space-y-1">
                  <strong className="text-white block text-sm">Creator Royalty (1.00% – 5.00%)</strong>
                  <span className="text-slate-400">Percentage of trading volume paid directly to the creator wallet in native ETH.</span>
                </div>
              </div>

              <div className="p-5 clay-surface space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Launch Features & Guarantees:</span>
                </h4>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                  <li><strong>Optional Opening Buy:</strong> Creators can specify an initial ETH buy amount in the exact atomic transaction to purchase supply before public discovery.</li>
                  <li><strong>Instant Auto-Redirect:</strong> As soon as the transaction confirms on Robinhood Chain, the frontend listens to the <code className="text-yellow-400 font-mono">TokenLaunched</code> event log and immediately routes you to the live trading page.</li>
                  <li><strong>Fixed Supply & Reserved Pool:</strong> Entire supply of <strong>1,000,000,000 tokens</strong> is minted to the curve; the reserved share is automatically migrated and permanently locked into Uniswap v4 upon graduation.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. TRADING & PRICING */}
          <section id="trading" className="scroll-mt-24 space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-black text-white">2. Trading & Bonding Curve Mechanics</h2>
              <p className="text-xs text-slate-400">Continuous algorithmic pricing and automated swap execution</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                Every token trades against <strong>native ETH</strong> in its dedicated Pons bonding curve contract. Prices update deterministically with each transaction based on constant-product virtual reserves:
              </p>

              <FormulaBox
                title="Constant-Product Invariant"
                formula="k = effectiveQuoteReserve * effectiveTokenReserve"
              />
              <FormulaBox
                title="Spot Price Formula (ETH per Token)"
                formula="priceScaled = (effectiveQuoteReserve * 1e18) / effectiveTokenReserve"
              />
              <FormulaBox
                title="Total Market Capitalization"
                formula="marketCap = (effectiveQuoteReserve * totalSupply) / effectiveTokenReserve"
              />

              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-white text-sm">How to Trade on the Platform</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 clay-surface space-y-2">
                    <span className="font-bold text-yellow-400 text-sm block">Buying Tokens (Buy)</span>
                    <p className="text-slate-300 leading-relaxed">
                      1. Enter the amount of native ETH you want to spend.<br />
                      2. Click <strong>Buy with ETH</strong>. Tokens are transferred directly into your wallet and spot price adjusts upward.<br />
                      3. No token approvals are required when spending native ETH!
                    </p>
                  </div>
                  <div className="p-4 clay-surface space-y-2">
                    <span className="font-bold text-rose-400 text-sm block">Selling Tokens (Sell)</span>
                    <p className="text-slate-300 leading-relaxed">
                      1. Choose the percentage of tokens you wish to sell (25%, 50%, 75%, or 100% Max).<br />
                      2. Click <strong>Approve Token</strong> to authorize the curve contract.<br />
                      3. Click <strong>Sell Token</strong>. You receive native ETH directly into your wallet balance and spot price adjusts downward.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 clay-surface text-xs space-y-2">
                <span className="font-bold text-white text-sm flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-yellow-400" />
                  <span>Real-Time Charts & On-Chain Activity Feed:</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  On every token page, traders can analyze an interactive real-time price & market cap chart. Below the chart, the <strong>Recent On-Chain Activity</strong> table displays real-time trades in a compact container with smooth vertical scrolling, sticky headers, and direct verification links to the Robinhood Blockscout Explorer.
                </p>
              </div>
            </div>
          </section>

          {/* 5. ANTI-SNIPE PROTECTION */}
          <section id="anti-snipe" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h2 className="text-2xl font-black text-white">3. Anti-Snipe Protection (99% Bot Decaying Tax)</h2>
              <p className="text-xs text-slate-400">Decaying protection tax during the first 5 seconds after launch</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                To prevent MEV bots and sniper scripts from extracting capital from human retail buyers on block 0, LOCKEY enforces a mathematical <strong>Decaying Snipe Tax</strong> directly inside the bonding curve smart contract for the first 5 seconds post-launch:
              </p>

              <div className="overflow-x-auto clay-surface p-1">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#081a33]/60 text-slate-200 border-b border-sky-500/20">
                    <tr>
                      <th className="p-3.5">Elapsed Time</th>
                      <th className="p-3.5">Snipe Tax</th>
                      <th className="p-3.5">Bot Impact</th>
                      <th className="p-3.5">Retail Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-500/10 text-slate-300">
                    <tr className="bg-rose-500/10">
                      <td className="p-3.5 text-rose-400 font-bold">0 seconds (Launch Block)</td>
                      <td className="p-3.5 text-rose-400 font-bold">99.00%</td>
                      <td className="p-3.5">Sniper bot loses 99% of capital to protocol</td>
                      <td className="p-3.5 text-amber-400">Wait 2-3 seconds</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-amber-400 font-bold">1 second</td>
                      <td className="p-3.5 text-amber-400 font-bold">25.00%</td>
                      <td className="p-3.5">Heavy penalty protection</td>
                      <td className="p-3.5 text-slate-400">Decays rapidly</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-yellow-400 font-bold">2 seconds</td>
                      <td className="p-3.5 text-yellow-400 font-bold">3.00%</td>
                      <td className="p-3.5">Minimal tax</td>
                      <td className="p-3.5 text-yellow-400">Safe for entry</td>
                    </tr>
                    <tr className="bg-yellow-400/5">
                      <td className="p-3.5 text-yellow-400 font-bold">5+ seconds</td>
                      <td className="p-3.5 text-yellow-400 font-bold">0.00%</td>
                      <td className="p-3.5">Protection concluded</td>
                      <td className="p-3.5 text-yellow-400 font-bold">Standard trading fees only (1% - 5%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <CodeSnippet
                caption="currentSnipeTaxBps logic in BondingCurve.sol"
                code={`function currentSnipeTaxBps(address recipient) public view override returns (uint256) {
    if (isSnipeExempt[recipient]) return 0;
    if (block.timestamp >= launchedAt + SNIPE_TAX_DURATION) return 0;

    uint256 elapsed = block.timestamp - launchedAt;
    if (elapsed == 0) return 9900; // 99%
    if (elapsed == 1) return 2500; // 25%
    if (elapsed == 2) return 300;  // 3%
    if (elapsed == 3) return 40;   // 0.4%
    if (elapsed == 4) return 5;    // 0.05%
    return 0;
}`}
              />
            </div>
          </section>

          {/* 6. GRADUATION */}
          <section id="graduation" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h2 className="text-2xl font-black text-white">4. Uniswap v4 DEX Graduation & Zero-Rug Guarantee</h2>
              <p className="text-xs text-slate-400">Target valuation achievement and automatic DEX liquidity migration</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                A token officially <strong>Graduates</strong> once its Market Cap reaches the <strong>$20,000 USDC target</strong> (10,000 basis points on the bonding curve progress bar).
              </p>

              <FormulaBox
                title="Progress Calculation Formula"
                formula="progressBps = ((currentMarketCap - initialMarketCap) * 10_000) / (graduationMarketCap - initialMarketCap)"
              />

              <div className="p-5 clay-surface space-y-3 text-xs">
                <span className="font-bold text-white text-sm flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-rose-400" />
                  <span>Zero-Rug & Anti-Dilution Guarantees on Uniswap v4 Migration:</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Upon graduation, the smart contracts orchestrate automated DEX migration with zero manual intervention:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li><strong>Curve Closure:</strong> The curve status transitions to <code className="text-amber-300 font-mono">GRADUATED</code> and bonding curve trading stops.</li>
                  <li><strong>Uniswap v4 Seeding:</strong> All accumulated USDC reserves (~$5,000 USDC) plus the 200,000,000 migration reserve tokens are paired directly into a full-range Uniswap v4 pool via <code className="text-sky-300 font-mono">UniswapV4Adapter</code>.</li>
                  <li><strong>Permanent LP NFT Burn (Zero-Rug Guarantee):</strong> Ownership of the Uniswap v4 liquidity position NFT is transferred directly to the dead address (<code className="text-rose-400 font-mono">0x000000000000000000000000000000000000dEaD</code>). Neither creators nor protocol admins can ever withdraw the liquidity.</li>
                  <li><strong>Burn Remaining Unsold Curve Tokens:</strong> Any unsold tokens remaining in the bonding curve are permanently burned to <code className="text-rose-400 font-mono">0xdead</code> to prevent supply dilution.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 7. FEES & ROYALTIES */}
          <section id="fees" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h2 className="text-2xl font-black text-white">5. Fees & Creator Royalties</h2>
              <p className="text-xs text-slate-400">Transparent and isolated revenue distribution</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                Every buy and sell trade on the bonding curve generates a fractional liquidity fee denominated in native ETH:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 clay-surface">
                  <span className="text-slate-400 block mb-1 font-semibold">Creator Royalty</span>
                  <span className="text-yellow-400 font-bold text-base">1.00% – 5.00%</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                    Configured by the creator at launch. Collects on the curve until swept into Pons FeeEscrow, then withdrawable anytime.
                  </p>
                </div>
                <div className="p-4 clay-surface">
                  <span className="text-slate-400 block mb-1 font-semibold">Protocol Fee</span>
                  <span className="text-yellow-400 font-bold text-base">0.50% – 1.00%</span>
                  <p className="text-[11px] text-slate-400 font-sans mt-1.5 leading-relaxed">
                    Dedicated to Robinhood Chain RPC node infrastructure maintenance and onchain indexers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 8. CREATOR DASHBOARD */}
          <section id="creator-guide" className="scroll-mt-24 space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h2 className="text-2xl font-black text-white">6. Creator Dashboard</h2>
              <p className="text-xs text-slate-400">Track trading volume and claim accrued ETH royalties with 1 click</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                Token creators can access the <strong>Creator Royalty Fees</strong> dashboard (<Link href="/creator-dashboard" className="text-yellow-400 hover:underline">/creator-dashboard</Link>) to monitor token metrics.
              </p>

              <div className="p-5 clay-surface space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>How to Claim Your Creator Royalties:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>Open <strong>Creator Royalty Fees</strong> with the same wallet used to launch the token.</li>
                  <li>Each of your tokens shows the fees still waiting on its curve. Click <strong>Sweep</strong> to move them into the Pons FeeEscrow (tokens with buyback enabled are swept by the Pons operator).</li>
                  <li>Check the <strong>Claimable in Fee Escrow</strong> balance (in native ETH).</li>
                  <li>Click <strong>Claim Royalties</strong> and confirm the transaction in your wallet. ETH royalties arrive directly in your wallet balance!</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 9. CTO */}
          <section id="cto" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h2 className="text-2xl font-black text-white">7. Community Takeovers (CTO)</h2>
              <p className="text-xs text-slate-400">Decentralized transfer when an original creator steps away</p>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p>
                If an original creator becomes inactive or abandons a project, token holders can organize a <strong>Community Takeover (CTO)</strong>. This mechanism empowers the community to update social channels (Twitter, Telegram, Website) and redirect future creator royalties to a community multisig or treasury wallet.
              </p>
              <div className="p-4 clay-surface text-xs text-slate-400">
                Bonding curve and Uniswap v4 liquidity is 100% immutable and strictly protected from any modification during a CTO.
              </div>
            </div>
          </section>

          {/* 10. RISKS */}
          <section id="risks" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h2 className="text-2xl font-black text-white">8. Risk Disclosures</h2>
              <p className="text-xs text-slate-400">Important market considerations and transparency disclosures</p>
            </div>

            <div className="p-5 clay-surface text-xs text-amber-200 space-y-2.5 border-amber-500/30">
              <span className="font-bold flex items-center space-x-2 text-amber-300 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Important Considerations</span>
              </span>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                <li>All tokens launched on LOCKEY are user-created and permissionless.</li>
                <li>Token names and tickers can be duplicated by other creators. Always verify the <strong>token contract address</strong> before trading.</li>
                <li>Cryptocurrency assets are volatile and trading involves market risk. Never trade more than you can afford to lose.</li>
                <li>LOCKEY is decentralized open-source software and does not provide financial or investment advice.</li>
              </ul>
            </div>
          </section>

          {/* =========================================================================
              PART 2: INTEGRATION & DEVELOPERS (Pons Code Reference Surface)
             ========================================================================= */}

          <div className="pt-10 border-t border-sky-500/20">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 clay-badge text-sky-300 text-xs font-mono font-bold mb-3">
              <Code2 className="w-3.5 h-3.5" />
              <span>Developer Reference Surface</span>
            </div>
            <h2 className="text-3xl font-black text-white">A minimal, verifiable integration surface.</h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Everything reads directly off onchain smart contracts. Index factory and curve events for a trust-minimized source of truth.
            </p>
          </div>

          {/* INTEGRATION: NETWORK */}
          <section id="network" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h3 className="text-xl font-black text-white">Network</h3>
              <p className="text-xs text-slate-400">Robinhood Chain Layer-2 with native ETH</p>
            </div>

            <div className="overflow-x-auto clay-surface p-1">
              <table className="w-full text-left text-xs font-mono">
                <tbody className="divide-y divide-sky-500/10 text-slate-300">
                  <tr>
                    <td className="p-3.5 text-slate-400">Network</td>
                    <td className="p-3.5 text-white font-bold">Robinhood Chain (Mainnet)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-slate-400">Chain ID</td>
                    <td className="p-3.5 text-sky-300 font-bold">4663</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-slate-400">Native Asset</td>
                    <td className="p-3.5 text-yellow-400 font-bold">Ether (ETH) — 18 Decimals</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-slate-400">Public RPC</td>
                    <td className="p-3.5"><code>https://rpc.mainnet.chain.robinhood.com</code></td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-slate-400">Explorer</td>
                    <td className="p-3.5">
                      <a href="https://robinhoodchain.blockscout.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center space-x-1 font-semibold">
                        <span>https://robinhoodchain.blockscout.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-slate-400">Fixed Supply</td>
                    <td className="p-3.5">1,000,000,000 (1 Billion)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* INTEGRATION: CONTRACTS */}
          <section id="contracts" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h3 className="text-xl font-black text-white">Contracts</h3>
              <p className="text-xs text-slate-400">Audited Pons v2 protocol contracts on Robinhood Chain</p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {[
                { role: "Launch Factory", address: CONTRACT_ADDRESSES.factory, note: "Deploys each launch, pins economics, drives graduation" },
                { role: "Launch & Buy Router", address: CONTRACT_ADDRESSES.launchAndBuy, note: "Atomic create + opening buy router" },
                { role: "Fee Escrow", address: CONTRACT_ADDRESSES.feeEscrow, note: "Holds claimable creator royalties & protocol balances" },
                { role: "Launch Locker", address: CONTRACT_ADDRESSES.launchLocker, note: "Permanently locks graduated Uniswap v4 positions" },
                { role: "Meme Hook", address: CONTRACT_ADDRESSES.memeHook, note: "Singleton Uniswap v4 fee accrual and distribution hook" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 clay-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-white text-sm block">{item.role}</span>
                    <span className="text-[11px] text-slate-400 font-sans">{item.note}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="px-3 py-1.5 clay-inset text-sky-300 text-[11px]">
                      {item.address}
                    </code>
                    <button
                      onClick={() => copyText(`c-${idx}`, item.address)}
                      className="p-2 clay-btn-secondary text-slate-200"
                    >
                      {copiedContract === `c-${idx}` ? <Check className="w-3.5 h-3.5 text-yellow-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* INTEGRATION: EVENTS */}
          <section id="events" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h3 className="text-xl font-black text-white">Onchain events</h3>
              <p className="text-xs text-slate-400">Index factory and curve events to derive real-time market data</p>
            </div>

            <div className="space-y-4 text-xs">
              <CodeSnippet
                caption="TokenCreated (topic0)"
                code="0xad827b8769af2ee1f1daabe1d3632fbd92475a236001baf1b0fc541ae488facf"
              />

              <CodeSnippet
                caption="TokenBought (topic0)"
                code="0x0e6586f818d103e43bbea35a671f1b7e6d8454866f959af81988f61e452b4a73"
              />

              <CodeSnippet
                caption="TokenSold (topic0)"
                code="0xbea68ab0c22ead8d2f0d2a03d8854ec4ea4d7cccddc1bb3c61bf3c8c6624a56e"
              />

              <CodeSnippet
                caption="Read launches with viem"
                code={`import { createPublicClient, http, parseAbiItem } from "viem";

const client = createPublicClient({
  chain: {
    id: 4663,
    name: "Robinhood Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
  },
  transport: http(),
});

// Query all token creation logs from the Factory
const launches = await client.getLogs({
  address: "${CONTRACT_ADDRESSES.factory}",
  event: parseAbiItem(
    "event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)"
  ),
  fromBlock: "earliest",
  toBlock: "latest",
});`}
              />

              <CodeSnippet
                caption="Buy or sell side detection from trade events"
                code={`// Determine trade direction from emitted event
const side = event.eventName === "CurveBuy" ? "buy" : "sell";
const trader = side === "buy" ? args.buyer : args.seller;
const volumeEth = Number(args.quoteIn || args.quoteOut) / 1e18;`}
              />
            </div>
          </section>

          {/* INTEGRATION: READING TOKEN STATE */}
          <section id="state" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h3 className="text-xl font-black text-white">Reading token state</h3>
              <p className="text-xs text-slate-400">Read metadata and curve parameters directly from the blockchain</p>
            </div>

            <div className="space-y-4 text-xs">
              <CodeSnippet
                caption="Token metadata and curve address"
                code={`import { parseAbi } from "viem";

// Every launched ERC-20 token is self-describing onchain
const tokenAbi = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function metadataURI() view returns (string)",
]);

const [name, symbol, decimals, totalSupply] = await Promise.all([
  client.readContract({ address: tokenAddress, abi: tokenAbi, functionName: "name" }),
  client.readContract({ address: tokenAddress, abi: tokenAbi, functionName: "symbol" }),
  client.readContract({ address: tokenAddress, abi: tokenAbi, functionName: "decimals" }),
  client.readContract({ address: tokenAddress, abi: tokenAbi, functionName: "totalSupply" }),
]);

// Resolve the Bonding Curve address from the Factory
const curveAddress = await client.readContract({
  address: "${CONTRACT_ADDRESSES.factory}",
  abi: parseAbi(["function getCurve(address token) view returns (address)"]),
  functionName: "getCurve",
  args: [tokenAddress],
});`}
              />

              <CodeSnippet
                caption="getLaunchedToken record from Factory"
                code={`const factoryAbi = parseAbi([
  "function tokenRecords(address token) view returns (address token, address curve, address creator, address quoteToken, uint256 createdAt)",
]);

const record = await client.readContract({
  address: "${CONTRACT_ADDRESSES.factory}",
  abi: factoryAbi,
  functionName: "tokenRecords",
  args: [tokenAddress],
});`}
              />
            </div>
          </section>

          {/* INTEGRATION: PRICING & GRADUATION */}
          <section id="pricing-code" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h3 className="text-xl font-black text-white">Pricing and graduation logic</h3>
              <p className="text-xs text-slate-400">Calculate spot prices, market cap, and graduation progress</p>
            </div>

            <div className="space-y-4 text-xs">
              <CodeSnippet
                caption="Price, reserves, and market cap"
                code={`const curveAbi = parseAbi([
  "function getCurrentPrice() view returns (uint256)",
  "function getMarketCap() view returns (uint256)",
  "function getProgress() view returns (uint256)",
  "function getReserves() view returns ((uint256 virtualQuoteReserve, uint256 virtualTokenReserve, uint256 realQuoteReserve, uint256 realTokenReserve))",
]);

const [priceScaled, marketCapInQuote, progressBps, reserves] = await Promise.all([
  client.readContract({ address: curveAddress, abi: curveAbi, functionName: "getCurrentPrice" }),
  client.readContract({ address: curveAddress, abi: curveAbi, functionName: "getMarketCap" }),
  client.readContract({ address: curveAddress, abi: curveAbi, functionName: "getProgress" }),
  client.readContract({ address: curveAddress, abi: curveAbi, functionName: "getReserves" }),
]);

// Price in USDC per token (divided by 1e18)
const priceUsdc = Number(priceScaled) / 1e18;

// Market Cap in USDC dollars (divided by 1e6)
const marketCapUsd = Number(marketCapInQuote) / 1e6;

// Graduation progress percentage (0 to 100%)
const progressPercent = Number(progressBps) / 100;`}
              />

              <CodeSnippet
                caption="Graduation status"
                code={`const status = await client.readContract({
  address: curveAddress,
  abi: parseAbi(["function status() view returns (uint8)"]),
  functionName: "status",
});

// 0: BONDING (Trading active on the bonding curve)
// 1: GRADUATED (Curve closed, liquidity migrated to Uniswap V4)
const isGraduated = status === 1;`}
              />
            </div>
          </section>

          {/* INTEGRATION: EXECUTING TRADES */}
          <section id="trade-code" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h3 className="text-xl font-black text-white">Executing trades (Buy / Sell)</h3>
              <p className="text-xs text-slate-400">Smart contract interactions for swapping tokens</p>
            </div>

            <div className="space-y-4 text-xs">
              <CodeSnippet
                caption="Buy execution (spend USDC to get Tokens)"
                code={`import { parseUnits } from "viem";

// 1. Fetch quote for buy amount
const buyQuote = await client.readContract({
  address: curveAddress,
  abi: parseAbi([
    "function quoteBuy(uint256 quoteAmountIn) view returns ((uint256 tokensOut, uint256 feeAmount, uint256 priceImpactBps, uint256 newMarketCap))",
  ]),
  functionName: "quoteBuy",
  args: [parseUnits("50", 6)], // 50 USDC
});

// 2. Approve USDC transfer
await walletClient.writeContract({
  address: "${CONTRACT_ADDRESSES.usdc}",
  abi: parseAbi(["function approve(address spender, uint256 amount) returns (bool)"]),
  functionName: "approve",
  args: [curveAddress, parseUnits("50", 6)],
});

// 3. Execute Buy with 1% slippage tolerance
const minTokensOut = (buyQuote.tokensOut * 99n) / 100n;
const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 Minutes

await walletClient.writeContract({
  address: curveAddress,
  abi: parseAbi([
    "function buy(uint256 quoteAmountIn, uint256 minTokensOut, uint256 deadline) returns (uint256)",
  ]),
  functionName: "buy",
  args: [parseUnits("50", 6), minTokensOut, deadline],
});`}
              />

              <CodeSnippet
                caption="Sell execution (sell Tokens to get USDC)"
                code={`// 1. Approve launch token
await walletClient.writeContract({
  address: tokenAddress,
  abi: parseAbi(["function approve(address spender, uint256 amount) returns (bool)"]),
  functionName: "approve",
  args: [curveAddress, tokenAmountToSell],
});

// 2. Execute Sell
await walletClient.writeContract({
  address: curveAddress,
  abi: parseAbi([
    "function sell(uint256 tokenAmountIn, uint256 minQuoteOut, uint256 deadline) returns (uint256)",
  ]),
  functionName: "sell",
  args: [tokenAmountToSell, minQuoteOut, deadline],
});`}
              />
            </div>
          </section>

          {/* INTEGRATION: CLAIMING FEES */}
          <section id="fee-code" className="scroll-mt-24 space-y-4">
            <div className="border-b border-sky-500/20 pb-3">
              <h3 className="text-xl font-black text-white">Fee claims and payout</h3>
              <p className="text-xs text-slate-400">Query and claim creator royalties from FeeManager</p>
            </div>

            <div className="space-y-4 text-xs">
              <CodeSnippet
                caption="Claiming creator fees with Viem"
                code={`const feeManagerAbi = parseAbi([
  "function getClaimableCreatorFees(address token, address creator) view returns (uint256)",
  "function claimCreatorFees(address token)",
]);

// Read unclaimed creator royalties
const claimable = await client.readContract({
  address: "${CONTRACT_ADDRESSES.feeManager}",
  abi: feeManagerAbi,
  functionName: "getClaimableCreatorFees",
  args: [tokenAddress, creatorAddress],
});

// Claim USDC directly to wallet
if (claimable > 0n) {
  await walletClient.writeContract({
    address: "${CONTRACT_ADDRESSES.feeManager}",
    abi: feeManagerAbi,
    functionName: "claimCreatorFees",
    args: [tokenAddress],
  });
}`}
              />
            </div>
          </section>

          {/* Bottom Claymorphic Action Footer */}
          <div className="p-8 clay-card flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="text-lg font-black text-white">Ready to launch your first token?</h3>
              <p className="text-xs text-slate-400 mt-1">Deploy a fair-launch token on Robinhood Chain in seconds.</p>
            </div>
            <div className="flex items-center space-x-3.5">
              <Link
                href="/create"
                className="px-6 py-3 clay-btn-primary text-slate-950 font-bold text-xs shadow-xl active:scale-95 transition flex items-center space-x-2"
              >
                <span>Launch Token Now</span>
                <Rocket className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="px-6 py-3 clay-btn-secondary text-slate-200 text-xs font-semibold active:scale-95 transition flex items-center space-x-2"
              >
                <span>Explore Curves</span>
                <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
