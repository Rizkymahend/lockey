"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, zeroAddress } from "viem";
import { Coins, Sparkles, Loader2, ShieldCheck, RefreshCw, ArrowDownToLine, AlertTriangle } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/config/chain";
import { PONS_FACTORY_ABI, PONS_CURVE_ABI, PONS_FEE_ESCROW_ABI } from "@/config/abis";
import { useToast } from "@/components/Toast";

type CreatorToken = {
  token: `0x${string}`;
  curve: `0x${string}`;
  name: string;
  symbol: string;
  recipient: `0x${string}`;
  taxBps: number;
  graduated: boolean;
  nativeQuote: boolean;
  pairToken: `0x${string}`;
  creatorTax: bigint; // creator tax still sitting on the curve (all yours after sweep)
  tradeFees: bigint; // trade fees on the curve (split with protocol after sweep)
};

type PlatformTokenRecord = { token: string; deployer: string; name: string; symbol: string };

const fmt = (v: bigint, d = 6) => Number(formatUnits(v, 18)).toFixed(d);

export default function CreatorDashboardPage() {
  const toast = useToast();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  const [tokens, setTokens] = useState<CreatorToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // ETH already credited in the escrow (claimable now)
  const { data: claimableEth, refetch: refetchClaimable } = useReadContract({
    address: CONTRACT_ADDRESSES.feeEscrow,
    abi: PONS_FEE_ESCROW_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  // Load the connected wallet's tokens and their unswept fee balances
  const loadTokens = useCallback(async () => {
    if (!address || !publicClient) return;
    setLoadingTokens(true);
    try {
      const res = await fetch("/api/tokens", { cache: "no-store" });
      const json = await res.json();
      const records: PlatformTokenRecord[] = Array.isArray(json?.tokens) ? json.tokens : [];
      const me = address.toLowerCase();

      const results = await Promise.all(
        records.map(async (r): Promise<CreatorToken | null> => {
          try {
            const info = await publicClient.readContract({
              address: CONTRACT_ADDRESSES.factory,
              abi: PONS_FACTORY_ABI,
              functionName: "getLaunchedToken",
              args: [r.token as `0x${string}`],
            });
            const isMine =
              info.creatorFeeRecipient.toLowerCase() === me ||
              info.deployer.toLowerCase() === me ||
              r.deployer?.toLowerCase() === me;
            if (!info.exists || !isMine) return null;

            const read = <T,>(functionName: "creatorTaxBalance" | "quoteFeeBalance" | "graduated" | "isNativeQuote" | "creatorTaxBps", fallback: T) =>
              publicClient
                .readContract({ address: info.curve, abi: PONS_CURVE_ABI, functionName })
                .then((v) => v as T)
                .catch(() => fallback);

            // Tax rate comes from the curve: the factory struct decode is unreliable for this field
            const [creatorTax, tradeFees, graduated, nativeQuote, taxBps] = await Promise.all([
              read<bigint>("creatorTaxBalance", 0n),
              read<bigint>("quoteFeeBalance", 0n),
              read<boolean>("graduated", false),
              read<boolean>("isNativeQuote", info.pairToken === zeroAddress),
              read<bigint>("creatorTaxBps", 0n),
            ]);

            return {
              token: info.token,
              curve: info.curve,
              name: r.name,
              symbol: r.symbol,
              recipient: info.creatorFeeRecipient,
              taxBps: Number(taxBps),
              graduated,
              nativeQuote,
              pairToken: info.pairToken,
              creatorTax,
              tradeFees,
            };
          } catch {
            return null;
          }
        })
      );
      setTokens(results.filter((t): t is CreatorToken => t !== null));
    } catch (e) {
      toast.error("Failed to load tokens", e instanceof Error ? e.message : "Could not read your tokens.");
    } finally {
      setLoadingTokens(false);
    }
  }, [address, publicClient, toast]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // ─── Transactions (sweep + claim share one writer) ─────────────────────────
  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const handledTxRef = useRef<string | null>(null);
  const pendingLabelRef = useRef<string>("");

  useEffect(() => {
    if (txSuccess && txHash && handledTxRef.current !== txHash) {
      handledTxRef.current = txHash;
      const label = pendingLabelRef.current;
      toast.success(
        label === "claim" ? "Creator Royalties Claimed!" : "Fees Swept to Escrow!",
        label === "claim"
          ? "Your ETH fees have been sent to your wallet."
          : "Fees moved from the curve into the Fee Escrow. You can claim them now.",
        txHash
      );
      setBusyKey(null);
      refetchClaimable();
      loadTokens();
    }
  }, [txSuccess, txHash, toast, refetchClaimable, loadTokens]);

  const errText = (e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("InternalSwapRequiresOperator")) {
      return "This token has buyback enabled, so only the Pons sweep operator can sweep its fees. Wait for the operator sweep.";
    }
    // Curve reverts with this selector when the caller is not the creator fee recipient
    if (msg.includes("0x8d42130c")) {
      return "Only the creator fee recipient can sweep this token. Connect the recipient wallet and try again.";
    }
    if (msg.toLowerCase().includes("user rejected")) return "Transaction rejected in wallet.";
    return msg.split("\n")[0];
  };

  const handleSweep = async (t: CreatorToken) => {
    if (!address || !publicClient) return;
    setBusyKey(t.curve);
    try {
      // Simulate first so a known revert shows a clear message instead of a wallet error
      await publicClient.simulateContract({
        account: address,
        address: t.curve,
        abi: PONS_CURVE_ABI,
        functionName: "sweepFees",
        args: [0n],
      });
      pendingLabelRef.current = "sweep";
      await writeContractAsync({
        address: t.curve,
        abi: PONS_CURVE_ABI,
        functionName: "sweepFees",
        args: [0n],
      });
    } catch (e) {
      toast.error("Sweep Failed", errText(e));
      setBusyKey(null);
    }
  };

  const handleClaim = async () => {
    setBusyKey("claim");
    try {
      pendingLabelRef.current = "claim";
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.feeEscrow,
        abi: PONS_FEE_ESCROW_ABI,
        functionName: "claim",
      });
    } catch (e) {
      toast.error("Claim Failed", errText(e));
      setBusyKey(null);
    }
  };

  const claimable = claimableEth ?? 0n;
  const totalUnsweptTax = tokens.reduce((s, t) => s + t.creatorTax, 0n);
  const isBusy = busyKey !== null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-yellow-400/10 text-yellow-400 text-xs font-mono font-bold tracking-wide border border-yellow-400/30">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Pons Protocol Payouts • Robinhood Chain</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Creator Royalty Fees</span>
          <span className="text-3xl">💰</span>
        </h1>
        <p className="text-sm text-zinc-400">
          Fees from trades on your tokens first collect on each token&apos;s bonding curve. Sweep them into the Pons Fee Escrow, then claim the ETH to your wallet.
        </p>
      </div>

      {/* Step 1: unswept fees per token */}
      <div className="p-6 sm:p-8 space-y-5 bg-[#121318] border border-zinc-800 rounded-2xl shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Step 1 · Fees waiting on your curves
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {fmt(totalUnsweptTax)} ETH <span className="text-sm text-zinc-500 font-sans">creator tax unswept</span>
            </div>
          </div>
          <button
            onClick={loadTokens}
            disabled={!isConnected || loadingTokens}
            className="p-2 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTokens ? "animate-spin" : ""}`} />
          </button>
        </div>

        {!isConnected ? (
          <p className="text-sm text-zinc-400">Connect your wallet to see your tokens.</p>
        ) : loadingTokens && tokens.length === 0 ? (
          <div className="flex items-center space-x-2 text-sm text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Reading your tokens on-chain…</span>
          </div>
        ) : tokens.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No tokens launched from this wallet were found. Fees go to the wallet set as the creator fee recipient at launch.
          </p>
        ) : (
          <div className="space-y-3">
            {tokens.map((t) => {
              const notRecipient = address && t.recipient.toLowerCase() !== address.toLowerCase();
              const nothing = t.creatorTax === 0n && t.tradeFees === 0n;
              return (
                <div key={t.token} className="p-4 rounded-xl border border-zinc-800 bg-black/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-white font-bold">
                        {t.name} <span className="text-zinc-400 font-mono text-sm">${t.symbol}</span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-500 truncate">{t.token}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Creator tax {t.taxBps / 100}% · {t.graduated ? "Graduated (Uniswap v4)" : "Bonding curve"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right font-mono text-xs space-y-0.5">
                        <div className="text-yellow-400">
                          {fmt(t.creatorTax)} <span className="text-zinc-500">creator tax</span>
                        </div>
                        <div className="text-zinc-300">
                          {fmt(t.tradeFees)} <span className="text-zinc-500">trade fees*</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSweep(t)}
                        disabled={isBusy || nothing || !!notRecipient}
                        title={notRecipient ? "Connect the fee recipient wallet to sweep" : nothing ? "No fees to sweep yet" : undefined}
                        className="py-2 px-4 rounded-lg border border-yellow-400/60 text-yellow-300 hover:bg-yellow-400/10 font-bold text-sm flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {busyKey === t.curve ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowDownToLine className="w-4 h-4" />
                        )}
                        <span>Sweep</span>
                      </button>
                    </div>
                  </div>
                  {notRecipient && (
                    <div className="flex items-start space-x-2 text-xs text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Fees for this token go to <span className="font-mono">{t.recipient}</span>, not the connected wallet. Only that wallet can sweep and claim them, so connect it to continue.
                      </span>
                    </div>
                  )}
                  {t.graduated && (
                    <div className="text-xs text-zinc-400">
                      After graduation, new fees collect in the Uniswap v4 hook and are swept by the Pons operator.
                    </div>
                  )}
                  {!t.nativeQuote && (
                    <div className="text-xs text-zinc-400">
                      This token is paired with <span className="font-mono">{t.pairToken}</span>; its fees are credited in that token, not ETH.
                    </div>
                  )}
                </div>
              );
            })}
            <p className="text-[11px] text-zinc-500">
              * Trade fees are split at sweep time: the protocol takes its share first, then buyback (if enabled), and the rest goes to you. Creator tax goes to you in full.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: claim from escrow */}
      <div className="p-6 sm:p-8 space-y-6 bg-[#121318] border border-zinc-800 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Step 2 · Claimable in Fee Escrow
            </span>
            <div className="text-4xl sm:text-5xl font-bold font-mono text-white flex items-center space-x-3">
              <Coins className="w-9 h-9 text-yellow-400" />
              <span>{fmt(claimable)} ETH</span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Already swept and ready to withdraw. No vesting or lockup.
            </p>
          </div>

          <button
            onClick={handleClaim}
            disabled={!isConnected || claimable === 0n || isBusy}
            className="py-3 px-7 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-base flex items-center justify-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors shadow-sm"
          >
            {busyKey === "claim" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-black" />
                <span>Claiming ETH...</span>
              </>
            ) : (
              <span>Claim {claimable > 0n ? `${fmt(claimable, 4)} ETH` : "Royalties"}</span>
            )}
          </button>
        </div>

        <div className="text-xs font-mono text-zinc-500 truncate">Escrow: {CONTRACT_ADDRESSES.feeEscrow}</div>

        <div className="p-4 sketch-surface rounded-sketch space-y-2 text-xs font-hand text-slate-300">
          <div className="font-bold text-white text-sm flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>How Do Creator Royalties Work?</span>
          </div>
          <p className="leading-relaxed text-slate-400 text-xs">
            Every trade on your token&apos;s bonding curve charges your creator tax. That ETH stays on the curve until someone sweeps it, either you (Sweep button above) or the Pons sweep operator. A sweep credits your share to the Fee Escrow, and from there you can claim it anytime. Tokens with buyback enabled can only be swept by the operator.
          </p>
        </div>
      </div>
    </div>
  );
}
