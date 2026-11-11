import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors/injected";
import { robinhoodChain } from "./chain";

export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  connectors: [
    injected(),
  ],
  transports: {
    // in the browser every read goes through our own /api/rpc (the official RPC is blocked on some networks)
    [robinhoodChain.id]: http(
      typeof window !== "undefined"
        ? `${window.location.origin}/api/rpc`
        : process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.mainnet.chain.robinhood.com",
      { batch: { batchSize: 20, wait: 16 }, retryCount: 2 }
    ),
  },
  ssr: true,
});

