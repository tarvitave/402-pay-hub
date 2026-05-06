export interface ComparisonRow {
  feature: string;
  x402: string;
  other: string;
  winner?: "x402" | "other" | "tie";
}

export interface Comparison {
  slug: string;
  competitor: string;
  competitorTagline: string;
  title: string;
  metaDescription: string;
  intro: string;
  verdict: string;
  rows: ComparisonRow[];
  whenToUseX402: string[];
  whenToUseOther: string[];
}

export const comparisons: Comparison[] = [
  {
    slug: "x402-vs-l402",
    competitor: "L402",
    competitorTagline: "Lightning-native HTTP 402 protocol",
    title: "x402 vs L402: HTTP-Native Payments Compared",
    metaDescription:
      "Compare x402 and L402 — two HTTP 402 micropayment protocols. Stablecoins vs Lightning, settlement, AI agent support, and developer experience.",
    intro:
      "Both x402 and L402 revive the long-dormant HTTP 402 status code, but they differ on settlement layer, payment asset, and target use case. x402 is stablecoin-first and chain-agnostic; L402 is Lightning Network-native and Bitcoin-only.",
    verdict:
      "Pick x402 for AI agents, USDC pricing, and EVM/Solana ecosystems. Pick L402 if Bitcoin/Lightning is non-negotiable and you want sub-cent settlement with no L1 footprint.",
    rows: [
      { feature: "Settlement layer", x402: "Stablecoins on Base, Ethereum, Solana", other: "Lightning Network (Bitcoin)", winner: "tie" },
      { feature: "Default asset", x402: "USDC", other: "BTC (sats)" },
      { feature: "Min payment", x402: "~$0.001", other: "1 sat (~$0.0006)", winner: "other" },
      { feature: "AI agent support", x402: "First-class (AgentWallet SDK)", other: "Community libraries", winner: "x402" },
      { feature: "Wallet UX", x402: "Existing EVM/Solana wallets", other: "Lightning wallet required" },
      { feature: "Volume to date", x402: "75M+ transactions", other: "Smaller, niche adoption", winner: "x402" },
      { feature: "Backed by", x402: "Coinbase, AWS, Stripe", other: "Lightning Labs ecosystem" },
    ],
    whenToUseX402: [
      "You want AI agents to pay APIs autonomously",
      "Stablecoin pricing matches your business model",
      "You're already on Base, Ethereum, or Solana",
    ],
    whenToUseOther: [
      "Your audience is Bitcoin-native",
      "You need true micropayments below 1¢",
      "You require off-chain, no-mempool settlement",
    ],
  },
  {
    slug: "x402-vs-lightning",
    competitor: "Lightning Network",
    competitorTagline: "Bitcoin layer 2 for instant payments",
    title: "x402 vs Lightning Network: Which is Better for API Payments?",
    metaDescription:
      "Lightning vs x402 for pay-per-use APIs and AI agents. Compare settlement, developer experience, wallet support, and machine-to-machine payments.",
    intro:
      "Lightning Network is a Bitcoin payment channel network — perfect for fast peer-to-peer Bitcoin transfers. x402 is an HTTP-native protocol layered on top of stablecoin rails. They overlap on micropayments but solve different problems.",
    verdict:
      "Lightning is a payment rail; x402 is a payment protocol. Use x402 when you want a drop-in HTTP middleware for monetizing endpoints. Use Lightning when you need raw Bitcoin payment infrastructure.",
    rows: [
      { feature: "Layer", x402: "Application protocol (HTTP)", other: "Payment network (L2)" },
      { feature: "Asset", x402: "Stablecoins (USDC primary)", other: "BTC" },
      { feature: "Setup time", x402: "Minutes (npm install)", other: "Hours (node + channels)", winner: "x402" },
      { feature: "Channel management", x402: "None — direct settlement", other: "Required (liquidity, routing)", winner: "x402" },
      { feature: "Truly micro (<1¢)", x402: "Limited by L2 gas", other: "Native sub-cent", winner: "other" },
      { feature: "AI agent ergonomics", x402: "Designed for it", other: "Possible but DIY", winner: "x402" },
    ],
    whenToUseX402: [
      "You want HTTP middleware that 'just works'",
      "You price in dollars, not sats",
      "Building agentic, non-Bitcoin-first products",
    ],
    whenToUseOther: [
      "Bitcoin-denominated business model",
      "You need pure peer-to-peer with no chain",
      "Streaming sub-cent payments",
    ],
  },
  {
    slug: "x402-vs-stripe",
    competitor: "Stripe",
    competitorTagline: "The traditional payments incumbent",
    title: "x402 vs Stripe: When to Use Crypto Micropayments",
    metaDescription:
      "Compare x402 micropayments to Stripe for API monetization. Fees, settlement, machine-to-machine payments, and the cases where each wins.",
    intro:
      "Stripe is the gold standard for card payments. x402 is a new HTTP-native protocol for stablecoin micropayments. They aren't direct competitors for most use cases — but for pay-per-use APIs and AI agents, x402 wins on fees and machine-to-machine flows.",
    verdict:
      "Use Stripe for human checkout, subscriptions, and large transactions. Use x402 for sub-dollar API calls, AI agents that pay autonomously, and any flow where a human credit card form would be friction.",
    rows: [
      { feature: "Min viable transaction", x402: "$0.001", other: "$0.50 (fees eat smaller)", winner: "x402" },
      { feature: "Per-tx fee", x402: "Network gas (~$0.001 on Base)", other: "2.9% + 30¢", winner: "x402" },
      { feature: "Settlement", x402: "Seconds, on-chain", other: "Days, fiat" },
      { feature: "Account required", x402: "Just a wallet address", other: "Stripe merchant account + KYC" },
      { feature: "AI agent native", x402: "Yes — agents hold wallets", other: "No — cards aren't agent-friendly", winner: "x402" },
      { feature: "Chargebacks / disputes", x402: "None", other: "Built in", winner: "other" },
      { feature: "Global reach", x402: "Anywhere with internet", other: "Country-by-country", winner: "x402" },
    ],
    whenToUseX402: [
      "Pay-per-API-call pricing",
      "AI agents transacting with your service",
      "Global, permissionless monetization",
    ],
    whenToUseOther: [
      "Human checkout for products and subscriptions",
      "You need consumer chargeback protection",
      "Fiat invoicing for enterprise contracts",
    ],
  },
];