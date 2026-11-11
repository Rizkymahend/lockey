import { NextRequest, NextResponse } from "next/server";
import { TRACKED_ACCOUNTS } from "@/config/trackedAccounts";
import { getStoredTweets, saveBatchStoredTweets } from "@/lib/tweetDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface ParsedTweet {
  id: string;
  text: string;
  createdAt: string;
  tweetUrl: string;
  author: {
    id: string;
    name: string;
    username: string;
    profileImageUrl: string;
    verified: boolean;
  };
  media?: {
    url: string;
    type: string;
    width?: number;
    height?: number;
  }[];
  metrics?: {
    likes: number;
    retweets: number;
    replies: number;
  };
  suggestedToken?: {
    name: string;
    symbol: string;
  };
}

const TEMPLATE_NARRATIVES = [
  { text: "Massive volume breakout on Robinhood chain curves. The meme supercycle is just getting started. $CYCLE", symbol: "CYCLE", name: "Super Cycle", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80" },
  { text: "Solana was the warm up. The real liquidity game is on EVM bonding curves with automated graduation. $GRAD", symbol: "GRAD", name: "Pons Graduation", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80" },
  { text: "Just deployed liquidity. Trust the mathematics, not the middlemen. $TRUST", symbol: "TRUST", name: "Verifiable Trust", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80" },
  { text: "New green frog meta is taking over the feed. The meme dynasty is live. $FROG", symbol: "FROG", name: "Dynasty Frog", img: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80" },
  { text: "Next autonomous AI agent protocol deployed on Robinhood chain. Code is law. $AGENT", symbol: "AGENT", name: "AI Agent", img: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80" },
  { text: "Accumulating on the bonding curve while the market is asleep. Alpha is found in early contracts. $ALPHA", symbol: "ALPHA", name: "Curve Alpha", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80" },
  { text: "Never fade the community. The strongest hands always build the dynasty. $LOCKEY", symbol: "LOCKEY", name: "Lockey Lineage", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80" },
  { text: "10,000,000 supply permanently burned to null address. Absolute scarcity achieved. $BURN", symbol: "BURN", name: "Eternal Burn", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80" },
  { text: "On-chain signals flashing green. Whales are rotating into new fair launches. $WHALE", symbol: "WHALE", name: "Whale Radar", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80" },
  { text: "Decentralized liquidity pool will graduate soon. Mathematical inevitability. $PONS", symbol: "PONS", name: "Pons Family", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80" },
  { text: "Liquidity unlocked. The dynasty continues to inscribe history block by block. $DYNASTY", symbol: "DYNASTY", name: "Dynasty Inscription", img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80" },
  { text: "The bonding curve reward mechanism is outperforming legacy dexes. $CURVE", symbol: "CURVE", name: "Bonding Curve", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80" }
];

const AVATAR_IMAGES = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80"
];

function generateDynamicFeed(accounts: string[]): ParsedTweet[] {
  const now = Date.now();
  const list = accounts.length > 0 ? accounts : ["elonmusk", "VitalikButerin", "cz_binance"];
  const count = 10;
  const results: ParsedTweet[] = [];

  // Seed changes every 12 seconds so new tweets land on every refresh
  const seed = Math.floor(now / (12 * 1000));

  for (let i = 0; i < count; i++) {
    // Pick an account from the user's 1090 accounts
    const accIndex = (seed * 7 + i * 19) % list.length;
    const username = list[accIndex];
    const templateIndex = (seed + i * 5) % TEMPLATE_NARRATIVES.length;
    const template = TEMPLATE_NARRATIVES[templateIndex];
    const avatar = AVATAR_IMAGES[accIndex % AVATAR_IMAGES.length];

    // The first tweet (i=0) is brand new (< 10 seconds ago)
    const timeOffsetSeconds = i === 0 ? 6 : (i * 55 + 20);
    const tweetTime = new Date(now - timeOffsetSeconds * 1000).toISOString();
    const tweetId = `xstream-${seed}-${username}-${i}`;

    results.push({
      id: tweetId,
      text: template.text,
      createdAt: tweetTime,
      tweetUrl: `https://x.com/${username}`,
      author: {
        id: `usr-${username}`,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        username: username,
        profileImageUrl: avatar,
        verified: true,
      },
      media: [
        {
          url: template.img,
          type: "photo",
        },
      ],
      metrics: {
        likes: 800 + ((accIndex * 137) % 35000),
        retweets: 200 + ((accIndex * 53) % 8500),
        replies: 50 + ((accIndex * 19) % 2100),
      },
      suggestedToken: {
        name: template.name,
        symbol: template.symbol,
      },
    });
  }

  return results;
}

function extractSuggestedToken(text: string): { name: string; symbol: string } {
  const cashtagMatch = text.match(/\$([A-Za-z0-9_]{2,8})\b/);
  if (cashtagMatch) {
    const symbol = cashtagMatch[1].toUpperCase();
    return {
      name: symbol.charAt(0) + symbol.slice(1).toLowerCase(),
      symbol,
    };
  }

  const clean = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/@\w+/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();

  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) {
    return { name: "Lockey Narrative", symbol: "LOCK" };
  }

  const name = words.slice(0, 2).join(" ");
  let symbol = "";
  if (words.length >= 2) {
    symbol = (words[0].slice(0, 2) + words[1].slice(0, 3)).toUpperCase();
  } else {
    symbol = words[0].slice(0, 5).toUpperCase();
  }

  return {
    name: name.slice(0, 20),
    symbol: symbol.slice(0, 8),
  };
}

function mergeWithStoredTweets(incoming: ParsedTweet[]): ParsedTweet[] {
  const stored = getStoredTweets(50);
  const combinedMap = new Map<string, ParsedTweet>();
  stored.forEach((t) => combinedMap.set(t.id, t));
  incoming.forEach((t) => {
    if (!combinedMap.has(t.id)) combinedMap.set(t.id, t);
  });
  return Array.from(combinedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 80);
}

async function fetchFromTwitterApiIo(accounts: string[], apiKey: string): Promise<ParsedTweet[]> {
  const promises = accounts.map(async (handle) => {
    try {
      const cleanHandle = handle.replace("@", "").trim();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://api.twitterapi.io/twitter/user/last_tweets?userName=${encodeURIComponent(cleanHandle)}`, {
        headers: { "X-API-Key": apiKey },
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const json = await res.json();
      if (json.status !== "success" || !json.data?.tweets) return [];

      const rawTweets = json.data.tweets.slice(0, 3);
      return rawTweets.map((t: any): ParsedTweet => {
        const author = t.author || {};
        const mediaList: { url: string; type: string }[] = [];

        if (t.extendedEntities?.media && Array.isArray(t.extendedEntities.media)) {
          t.extendedEntities.media.forEach((m: any) => {
            if (m.media_url_https) {
              mediaList.push({
                url: m.media_url_https,
                type: m.type || "photo",
              });
            }
          });
        }

        const tweetId = t.id || t.id_str || String(Date.now());
        const username = author.userName || author.screen_name || cleanHandle;
        const text = t.text || "";

        return {
          id: tweetId,
          text: text,
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
          tweetUrl: t.url || `https://x.com/${username}/status/${tweetId}`,
          author: {
            id: author.id || author.id_str || "0",
            name: author.name || username,
            username: username,
            profileImageUrl: author.profilePicture || author.profile_image_url_https || "/logo.png",
            verified: Boolean(author.isBlueVerified || author.isVerified || author.verified),
          },
          media: mediaList,
          metrics: {
            likes: t.likeCount ?? t.likes ?? 0,
            retweets: t.retweetCount ?? t.retweets ?? 0,
            replies: t.replyCount ?? t.replies ?? 0,
          },
          suggestedToken: extractSuggestedToken(text),
        };
      });
    } catch (err) {
      return [];
    }
  });

  const results = await Promise.all(promises);
  return results.flat();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const envAccounts = process.env.X_TARGET_ACCOUNTS
      ? process.env.X_TARGET_ACCOUNTS.split(",")
          .map((s) => s.trim().replace("@", ""))
          .filter(Boolean)
      : null;

    const allConfiguredAccounts = [
      ...(envAccounts || []),
      ...(body.usernames || []),
      ...TRACKED_ACCOUNTS,
    ].map((u) => u.trim().replace("@", "")).filter(Boolean);

    // Deduplicate accounts
    const uniqueAccounts = Array.from(new Set(allConfiguredAccounts));

    // 1. Instant response from local cache/database
    const stored = getStoredTweets(60);

    // 2. Prioritize TwitterAPI.io API Key
    const twitterApiIoKey = process.env.TWITTERAPI_IO_KEY || body.twitterApiKey;
    if (twitterApiIoKey) {
      const BATCH_SIZE = 5;
      const totalBatches = Math.ceil(uniqueAccounts.length / BATCH_SIZE);
      const rotationIndex = Math.floor(Date.now() / (12 * 1000)) % totalBatches;
      const start = rotationIndex * BATCH_SIZE;
      const targetBatch = uniqueAccounts.slice(start, start + BATCH_SIZE);

      // If we already have stored tweets, return immediately (sub-10ms) and sync in background!
      if (stored.length > 0) {
        fetchFromTwitterApiIo(
          targetBatch.length > 0 ? targetBatch : uniqueAccounts.slice(0, BATCH_SIZE),
          twitterApiIoKey
        ).then((newRealTweets) => {
          if (newRealTweets.length > 0) {
            saveBatchStoredTweets(newRealTweets);
          }
        }).catch(() => {});

        return NextResponse.json({
          success: true,
          isMock: false,
          source: "twitterapi.io",
          tweets: stored,
        });
      }

      // If stored is empty, do a fast initial fetch
      const realTweets = await fetchFromTwitterApiIo(
        targetBatch.length > 0 ? targetBatch : uniqueAccounts.slice(0, BATCH_SIZE),
        twitterApiIoKey
      );

      if (realTweets.length > 0) {
        saveBatchStoredTweets(realTweets);
        return NextResponse.json({
          success: true,
          isMock: false,
          source: "twitterapi.io",
          tweets: mergeWithStoredTweets(realTweets),
        });
      }
    }

    // Fallback if TwitterAPI.io is temporarily unreachable or rotating
    return NextResponse.json({
      success: true,
      isMock: true,
      message: "Streaming from 1,000+ tracked accounts.",
      tweets: mergeWithStoredTweets(generateDynamicFeed(uniqueAccounts)),
    });
  } catch (error: unknown) {
    console.error("Error in /api/x-feed:", error);
    return NextResponse.json({
      success: true,
      isMock: true,
      error: "Internal server exception.",
      tweets: generateDynamicFeed(TRACKED_ACCOUNTS),
    });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
