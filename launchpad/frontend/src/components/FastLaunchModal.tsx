"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from "wagmi";
import { parseUnits, parseEventLogs, toHex } from "viem";
import { Rocket, X, Loader2, CheckCircle2, AlertCircle, Coins, Sparkles, ExternalLink } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/config/chain";
import { PONS_FACTORY_ABI, PONS_ROUTER_ABI } from "@/config/abis";
import { ParsedTweet } from "@/app/api/x-feed/route";
import { checkLogoBeforeLaunch } from "@/lib/logo";

interface FastLaunchModalProps {
  tweet: ParsedTweet | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FastLaunchModal({ tweet, isOpen, onClose }: FastLaunchModalProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [devBuyEth, setDevBuyEth] = useState("");
  const [creatorFeePercent, setCreatorFeePercent] = useState<number>(2); // Default 2%, same as /create
  const [website, setWebsite] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);

  // Initialize or reset from tweet
  useEffect(() => {
    if (tweet) {
      setName(tweet.suggestedToken?.name || "Lockey Narrative");
      setSymbol(tweet.suggestedToken?.symbol || "LOCK");
      
      const mediaImage = tweet.media?.[0]?.url;
      setLogoUrl(mediaImage || tweet.author.profileImageUrl || "/logo.png");

      const tweetSource = tweet.tweetUrl ? `\n\nInspired by @${tweet.author.username}: ${tweet.tweetUrl}` : "";
      setDescription(`"${tweet.text}"${tweetSource}`);

      const tweetPostLink = tweet.tweetUrl || (tweet.author?.username ? `https://x.com/${tweet.author.username}` : "");
      setWebsite(tweetPostLink);

      setDevBuyEth("");
      setStatusError(null);
    }
  }, [tweet]);

  // Read Protocol Settings
  const { data: launchFee } = useReadContract({
    address: CONTRACT_ADDRESSES.factory,
    abi: PONS_FACTORY_ABI,
    functionName: "launchFee",
  });

  const { data: expectedEconomics } = useReadContract({
    address: CONTRACT_ADDRESSES.factory,
    abi: PONS_FACTORY_ABI,
    functionName: "previewLaunchEconomics",
    args: [0n, "0x0000000000000000000000000000000000000000"],
  });

  const { data: userEthBalance } = useBalance({
    address: address,
  });

  const { writeContract, data: txHash, isPending: isSubmitting } = useWriteContract();
  const { data: txReceipt, isLoading: isWaitingTx, isSuccess: isCreated } = useWaitForTransactionReceipt({ hash: txHash });

  const redirectedRef = useRef(false);

  useEffect(() => {
    if (isCreated && txReceipt && !redirectedRef.current) {
      let tokenAddr: string | null = null;
      let curveAddr: string | null = null;
      try {
        const parsedLogs = parseEventLogs({
          abi: PONS_FACTORY_ABI,
          eventName: "TokenLaunched",
          logs: txReceipt.logs,
        });

        if (parsedLogs.length > 0) {
          const args = parsedLogs[0].args as { token?: string; curve?: string };
          tokenAddr = args.token || null;
          curveAddr = args.curve || null;
        }
      } catch (err) {
        console.warn("Could not parse TokenLaunched event from receipt:", err);
      }

      if (tokenAddr) {
        redirectedRef.current = true;
        // Register token in backend
        fetch("/api/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenAddr,
            curve: curveAddr,
            deployer: address,
            name,
            symbol,
            logo: logoUrl,
            description,
            createdAt: new Date().toISOString(),
          }),
        }).catch((e) => console.warn("Could not save to /api/tokens:", e));

        setTimeout(() => {
          onClose();
          router.push(`/token/${tokenAddr}`);
        }, 1200);
      }
    }
  }, [isCreated, txReceipt, address, name, symbol, logoUrl, description, router, onClose]);

  if (!isOpen || !tweet) return null;

  const currentLaunchFee = launchFee ?? parseUnits("0.0005", 18);
  const parsedDevBuy = devBuyEth && Number(devBuyEth) > 0 ? parseUnits(devBuyEth, 18) : 0n;
  const totalRequiredEth = currentLaunchFee + parsedDevBuy;

  const isInsufficientEth = userEthBalance && userEthBalance.value < totalRequiredEth;

  const handleFastLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError(null);

    if (!isConnected || !address) {
      setStatusError("Please connect your Web3 wallet first.");
      return;
    }

    if (!name.trim() || !symbol.trim()) {
      setStatusError("Name and symbol are required.");
      return;
    }

    // The logo is written on-chain and can never be changed: it must be a public link that loads.
    const logoError = await checkLogoBeforeLaunch(logoUrl);
    if (logoError) {
      setStatusError(logoError);
      return;
    }

    try {
      const salt = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const fallbackEconomics = expectedEconomics || "0x0000000000000000000000000000000000000000000000000000000000000000";

      const tokenParams = {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        logo: logoUrl.trim(),
        description: description.trim(),
        socials: {
          twitter: tweet.tweetUrl || `https://x.com/${tweet.author.username}`,
          telegram: "",
          discord: "",
          website: website.trim() || tweet.tweetUrl || (tweet.author.username ? `https://x.com/${tweet.author.username}` : ""),
          farcaster: "",
        },
        creatorFeeRecipient: address,
        creatorTaxBps: Math.min(Math.max(Math.round(creatorFeePercent * 100), 0), 1000),
        buybackEnabled: false,
        expectedEconomics: fallbackEconomics,
        salt,
      };

      if (parsedDevBuy > 0n) {
        writeContract({
          address: CONTRACT_ADDRESSES.launchAndBuy,
          abi: PONS_ROUTER_ABI,
          functionName: "launchAndBuy",
          args: [
            tokenParams,
            0n,
            "0x0000000000000000000000000000000000000000",
            parsedDevBuy,
            0n,
            address,
            [],
          ],
          value: totalRequiredEth,
        });
      } else {
        writeContract({
          address: CONTRACT_ADDRESSES.factory,
          abi: PONS_FACTORY_ABI,
          functionName: "launchToken",
          args: [
            tokenParams,
            0n,
            "0x0000000000000000000000000000000000000000",
          ],
          value: currentLaunchFee,
        });
      }
    } catch (err: unknown) {
      console.error("Fast launch error:", err);
      const msg = err instanceof Error ? err.message : "Failed to initiate token launch";
      setStatusError(msg);
    }
  };

  const handleOpenInFullStudio = () => {
    onClose();
    const params = new URLSearchParams({
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      logo: logoUrl.trim(),
      desc: description.trim(),
      twitter: tweet.tweetUrl || "",
    });
    router.push(`/create?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#121318] p-6 sm:p-8 space-y-6 rounded-2xl border border-zinc-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
              <Rocket className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Instant Narrative Launch
              </h2>
              <p className="text-xs text-zinc-400">
                Deploying token on Robinhood Chain Pons v2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Origin Tweet Summary */}
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start space-x-3 text-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tweet.author.profileImageUrl}
            alt={tweet.author.name}
            className="w-8 h-8 rounded-full border border-yellow-500/40 object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5 font-semibold text-white">
              <span className="truncate">{tweet.author.name}</span>
              <span className="text-yellow-400 font-mono text-[11px]">@{tweet.author.username}</span>
            </div>
            <p className="text-zinc-300 text-xs line-clamp-2 mt-0.5 font-sans leading-relaxed">
              &ldquo;{tweet.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Launch Form */}
        <form onSubmit={handleFastLaunch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Token Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-colors font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Ticker / Symbol *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-sm uppercase text-yellow-400 font-bold focus:outline-none focus:border-yellow-400 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Logo Preview & URL */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Logo URL (Auto-filled from Tweet / Avatar)
            </label>
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-lg border border-yellow-500/40 bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl || "/logo.png"}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                />
              </div>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... or ipfs://..."
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-200 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>
          </div>

          {/* Website / Tweet Post Link */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Website / Tweet Post Link
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://x.com/..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700/80 text-xs font-mono text-zinc-200 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Initial Dev Buy */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">
                Initial Dev Buy (Optional)
              </span>
              <span className="text-[11px] text-zinc-400 block font-sans">
                Snipe first batch on the curve in ETH
              </span>
            </div>
            <div className="w-32 relative">
              <input
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0 ETH"
                value={devBuyEth}
                onChange={(e) => setDevBuyEth(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-white text-right focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Royalty Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Creator Trading Royalty:</span>
              <span className="font-bold text-yellow-400 font-mono">{creatorFeePercent}%</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 5].map((fee) => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setCreatorFeePercent(fee)}
                  className={`py-2 rounded-lg text-xs font-semibold font-mono transition-colors ${
                    creatorFeePercent === fee
                      ? "bg-yellow-400 text-black shadow-sm font-bold"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80"
                  }`}
                >
                  {fee}%
                </button>
              ))}
            </div>
          </div>


          {/* Error Message */}
          {statusError && (
            <p className="text-xs text-rose-400 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusError}</span>
            </p>
          )}

          {/* Insufficient balance warning */}
          {isInsufficientEth && (
            <p className="text-xs text-amber-300 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Insufficient ETH balance for launch fee + initial dev buy.</span>
            </p>
          )}

          {/* Success state */}
          {isCreated && (
            <div className="p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/40 text-yellow-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-yellow-400 animate-bounce" />
              <span>Token deployed on Robinhood Chain! Redirecting to curve...</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || isWaitingTx || isCreated || isInsufficientEth}
              className="w-full sm:flex-1 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting || isWaitingTx ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>{isSubmitting ? "Confirm in Wallet..." : "Deploying on Curve..."}</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>🚀 1-Click Launch Token</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenInFullStudio}
              className="w-full sm:w-auto px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-yellow-400 flex items-center justify-center space-x-1 transition-colors"
            >
              <span>Customize in Studio</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
