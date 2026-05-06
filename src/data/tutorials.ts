import type { ReactNode } from "react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface TutorialStep {
  title: string;
  body: string;
  code?: { lang: string; content: string };
}

export interface Tutorial {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  difficulty: Difficulty;
  readTime: string;
  framework: string;
  tags: string[];
  iconName: "BookOpen" | "Code2" | "Layers" | "Cpu";
  steps: string[];
  walkthrough: TutorialStep[];
  prerequisites: string[];
}

export const tutorials: Tutorial[] = [
  {
    id: 1,
    slug: "first-paid-endpoint-express",
    title: "Getting Started with x402: Your First Paid Endpoint",
    excerpt:
      "Build a simple Express.js API that charges 1¢ per request using x402. From zero to a working micropayment endpoint in 15 minutes.",
    difficulty: "Beginner",
    readTime: "15 min",
    framework: "Express.js",
    tags: ["Node.js", "Express", "USDC"],
    iconName: "BookOpen",
    steps: [
      "Install the x402 middleware package",
      "Configure your wallet address for receiving payments",
      "Add the paymentMiddleware to your Express app",
      "Define pricing for each endpoint",
      "Test with the x402 client SDK",
    ],
    prerequisites: [
      "Node.js 18+ installed",
      "An EVM wallet address (Base recommended)",
      "Basic familiarity with Express.js",
    ],
    walkthrough: [
      {
        title: "1. Install dependencies",
        body: "Create a new project and install Express plus the x402 middleware.",
        code: {
          lang: "bash",
          content: "mkdir paid-api && cd paid-api\nnpm init -y\nnpm install express x402-express",
        },
      },
      {
        title: "2. Configure your receiving wallet",
        body: "x402 needs to know which address should receive payments. Use any EVM wallet address — Base is recommended for low fees.",
        code: {
          lang: "bash",
          content: "# .env\nPAY_TO_ADDRESS=0xYourWalletHere\nNETWORK=base",
        },
      },
      {
        title: "3. Wire up the middleware",
        body: "Mount the payment middleware before your routes and define a price per path.",
        code: {
          lang: "ts",
          content:
            "import express from \"express\";\nimport { paymentMiddleware } from \"x402-express\";\n\nconst app = express();\n\napp.use(\n  paymentMiddleware(process.env.PAY_TO_ADDRESS!, {\n    \"GET /premium\": { price: \"$0.01\", network: \"base\" },\n  })\n);\n\napp.get(\"/premium\", (_req, res) => {\n  res.json({ secret: \"You paid 1¢ for this!\" });\n});\n\napp.listen(3000);",
        },
      },
      {
        title: "4. Test the 402 response",
        body: "Hit the endpoint without paying — you'll get an HTTP 402 with payment instructions in the body.",
        code: {
          lang: "bash",
          content: "curl -i http://localhost:3000/premium\n# HTTP/1.1 402 Payment Required\n# x402-version: 1\n# { accepts: [...] }",
        },
      },
      {
        title: "5. Pay with the client SDK",
        body: "Use the x402-fetch wrapper to handle the payment automatically from a client.",
        code: {
          lang: "ts",
          content:
            "import { wrapFetchWithPayment } from \"x402-fetch\";\nimport { privateKeyToAccount } from \"viem/accounts\";\n\nconst account = privateKeyToAccount(process.env.PRIVATE_KEY!);\nconst paidFetch = wrapFetchWithPayment(fetch, account);\n\nconst res = await paidFetch(\"http://localhost:3000/premium\");\nconsole.log(await res.json());",
        },
      },
    ],
  },
  {
    id: 2,
    slug: "nextjs-api-monetization",
    title: "x402 + Next.js: Monetize Your API Routes",
    excerpt:
      "Add pay-per-use pricing to Next.js API routes and server actions. Learn how to gate premium content and data behind x402 micropayments.",
    difficulty: "Intermediate",
    readTime: "20 min",
    framework: "Next.js",
    tags: ["React", "Vercel", "Server Actions"],
    iconName: "Layers",
    steps: [
      "Set up x402 in a Next.js project",
      "Create a middleware wrapper for API routes",
      "Implement payment verification in server actions",
      "Build a client-side payment flow component",
      "Deploy to Vercel with environment variables",
    ],
    prerequisites: ["Next.js 14+ App Router project", "Vercel account", "An EVM wallet"],
    walkthrough: [
      {
        title: "1. Install x402 for Next.js",
        body: "Add the Next.js bindings to your project.",
        code: { lang: "bash", content: "npm install x402-next" },
      },
      {
        title: "2. Create middleware.ts",
        body: "Next.js Edge Middleware runs before your route handlers — perfect place for the 402 check.",
        code: {
          lang: "ts",
          content:
            "import { paymentMiddleware } from \"x402-next\";\n\nexport default paymentMiddleware(process.env.PAY_TO_ADDRESS!, {\n  \"/api/premium\": { price: \"$0.01\", network: \"base\" },\n});\n\nexport const config = { matcher: [\"/api/premium/:path*\"] };",
        },
      },
      {
        title: "3. Build the protected route",
        body: "The handler only runs after a valid payment is verified upstream.",
        code: {
          lang: "ts",
          content:
            "export async function GET() {\n  return Response.json({ data: \"premium content\" });\n}",
        },
      },
      {
        title: "4. Client-side payment hook",
        body: "Use the x402-fetch wrapper or x402-react hook to surface a Pay UI to users.",
        code: {
          lang: "tsx",
          content:
            "\"use client\";\nimport { useX402Pay } from \"x402-react\";\n\nexport function Premium() {\n  const { fetchWithPayment, isPaying } = useX402Pay();\n  return (\n    <button onClick={() => fetchWithPayment(\"/api/premium\")}>\n      {isPaying ? \"Paying…\" : \"Unlock for 1¢\"}\n    </button>\n  );\n}",
        },
      },
      {
        title: "5. Deploy to Vercel",
        body: "Add PAY_TO_ADDRESS as an environment variable in your Vercel project, then push.",
      },
    ],
  },
  {
    id: 3,
    slug: "ai-agent-pays-for-data",
    title: "Building an AI Agent That Pays for Data",
    excerpt:
      "Create an autonomous AI agent using LangChain that can discover x402-enabled APIs, negotiate prices, and pay for data access without human intervention.",
    difficulty: "Advanced",
    readTime: "30 min",
    framework: "Python + LangChain",
    tags: ["AI Agent", "LangChain", "Autonomous"],
    iconName: "Cpu",
    steps: [
      "Set up an agent wallet with the AgentWallet SDK",
      "Implement 402 response detection in LangChain tools",
      "Build automatic payment approval logic",
      "Chain API calls with autonomous payment flow",
      "Add budget limits and spending controls",
    ],
    prerequisites: ["Python 3.10+", "OpenAI or Anthropic API key", "Funded test wallet on Base Sepolia"],
    walkthrough: [
      {
        title: "1. Install the agent toolkit",
        body: "We'll use LangChain plus the x402 Python client.",
        code: { lang: "bash", content: "pip install langchain langchain-openai x402-client web3" },
      },
      {
        title: "2. Create an agent wallet",
        body: "Generate a dedicated wallet for the agent — never reuse personal keys.",
        code: {
          lang: "python",
          content:
            "from x402_client import AgentWallet\n\nwallet = AgentWallet.create(network=\"base-sepolia\")\nwallet.set_budget(daily_limit_usd=5.00)",
        },
      },
      {
        title: "3. Wrap fetch in a paying tool",
        body: "Detect 402 responses, verify the price is within budget, and pay automatically.",
        code: {
          lang: "python",
          content:
            "from x402_client import paid_get\n\ndef fetch_paid(url: str) -> str:\n    return paid_get(url, wallet=wallet, max_price_usd=0.10).text",
        },
      },
      {
        title: "4. Expose as a LangChain tool",
        body: "Now your LLM agent can call any x402 API on its own.",
        code: {
          lang: "python",
          content:
            "from langchain.tools import Tool\n\ntools = [Tool(name=\"paid_fetch\", func=fetch_paid, description=\"Fetch a URL, paying via x402 if required.\")]",
        },
      },
      {
        title: "5. Add spend controls",
        body: "Always cap daily spend, log every transaction, and alert on anomalies. Agentic payments without guardrails is how you wake up to a drained wallet.",
      },
    ],
  },
  {
    id: 4,
    slug: "cloudflare-workers-x402",
    title: "x402 with Cloudflare Workers",
    excerpt:
      "Deploy x402 payment-gated APIs on the edge with Cloudflare Workers. Sub-50ms response times with built-in stablecoin verification.",
    difficulty: "Intermediate",
    readTime: "18 min",
    framework: "Cloudflare Workers",
    tags: ["Edge Computing", "Wrangler", "Global"],
    iconName: "Code2",
    steps: [
      "Initialize a Cloudflare Worker project",
      "Install the x402 verification library",
      "Implement payment verification at the edge",
      "Configure KV storage for payment receipts",
      "Deploy globally with wrangler",
    ],
    prerequisites: ["Cloudflare account with Workers enabled", "Wrangler CLI installed", "Base wallet"],
    walkthrough: [
      {
        title: "1. Bootstrap the Worker",
        body: "Use Wrangler to scaffold a new TypeScript Worker.",
        code: { lang: "bash", content: "npm create cloudflare@latest paid-worker -- --type=worker-ts" },
      },
      {
        title: "2. Install the verifier",
        body: "x402-cloudflare ships an edge-friendly verifier that uses fetch (no Node deps).",
        code: { lang: "bash", content: "npm install x402-cloudflare" },
      },
      {
        title: "3. Implement the handler",
        body: "Verify the X-PAYMENT header on every request before serving the response.",
        code: {
          lang: "ts",
          content:
            "import { verifyPayment, requirePayment } from \"x402-cloudflare\";\n\nexport default {\n  async fetch(req: Request, env: Env) {\n    const result = await verifyPayment(req, {\n      payTo: env.PAY_TO,\n      price: \"$0.005\",\n      network: \"base\",\n    });\n    if (!result.ok) return requirePayment(result);\n    return Response.json({ data: \"edge premium\" });\n  },\n};",
        },
      },
      {
        title: "4. Add KV for receipts",
        body: "Store transaction hashes in KV to prevent replay attacks.",
        code: {
          lang: "toml",
          content: "[[kv_namespaces]]\nbinding = \"RECEIPTS\"\nid = \"<your-kv-id>\"",
        },
      },
      {
        title: "5. Deploy globally",
        body: "wrangler deploy ships your paid endpoint to 300+ cities at once.",
        code: { lang: "bash", content: "npx wrangler deploy" },
      },
    ],
  },
  {
    id: 5,
    slug: "multi-chain-x402-v2",
    title: "Multi-Chain Payments with x402 V2",
    excerpt:
      "Leverage x402 V2's CAIP standards to accept payments across Ethereum, Base, Arbitrum, and Solana from a single endpoint configuration.",
    difficulty: "Advanced",
    readTime: "25 min",
    framework: "Node.js",
    tags: ["Multi-chain", "CAIP", "x402 V2"],
    iconName: "Layers",
    steps: [
      "Understand CAIP chain and asset identifiers",
      "Configure multi-chain payment accepts",
      "Implement chain-specific verification",
      "Handle cross-chain settlement",
      "Test with multiple wallet providers",
    ],
    prerequisites: ["Existing x402 v1 integration", "Wallets on at least two networks"],
    walkthrough: [
      {
        title: "1. CAIP IDs at a glance",
        body: "x402 V2 uses CAIP-2 (chains) and CAIP-19 (assets). For example USDC on Base is eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913.",
      },
      {
        title: "2. Declare multiple accepts",
        body: "Each `accepts` entry maps to a chain and asset the server is willing to take.",
        code: {
          lang: "ts",
          content:
            "const accepts = [\n  { scheme: \"exact\", chain: \"eip155:8453\", asset: \"USDC\", maxAmountRequired: \"10000\" },\n  { scheme: \"exact\", chain: \"eip155:42161\", asset: \"USDC\", maxAmountRequired: \"10000\" },\n  { scheme: \"exact\", chain: \"solana:mainnet\", asset: \"USDC\", maxAmountRequired: \"10000\" },\n];",
        },
      },
      {
        title: "3. Verify per chain",
        body: "The verifier dispatches to the correct chain client based on the CAIP-2 prefix.",
      },
      {
        title: "4. Settlement",
        body: "Use a settlement service or run your own facilitator to batch payouts and minimize fees.",
      },
      {
        title: "5. Test across wallets",
        body: "Verify with MetaMask, Coinbase Wallet, and Phantom to make sure your fallback UX works for every payer.",
      },
    ],
  },
  {
    id: 6,
    slug: "rest-api-tiered-pricing",
    title: "Monetizing a REST API with x402",
    excerpt:
      "Take an existing REST API and add tiered pricing: free endpoints, pay-per-call endpoints, and subscription-like bulk access with wallet-based identity.",
    difficulty: "Beginner",
    readTime: "12 min",
    framework: "Express.js",
    tags: ["REST API", "Tiered Pricing", "Identity"],
    iconName: "BookOpen",
    steps: [
      "Audit your API for monetizable endpoints",
      "Define a pricing strategy per route",
      "Implement x402 middleware with route-level config",
      "Enable wallet-based identity for repeat users",
      "Monitor revenue with payment event hooks",
    ],
    prerequisites: ["An existing Express REST API"],
    walkthrough: [
      {
        title: "1. Pick your paywalled routes",
        body: "Keep cheap, high-volume reads free. Charge for expensive computation, fresh data, or write operations.",
      },
      {
        title: "2. Set tiered prices",
        body: "Map each route to a price. Match the value of the response — overpriced endpoints kill adoption.",
        code: {
          lang: "ts",
          content:
            "const pricing = {\n  \"GET /search\": { price: \"$0.001\" },\n  \"GET /report/:id\": { price: \"$0.05\" },\n  \"POST /generate\": { price: \"$0.25\" },\n};",
        },
      },
      {
        title: "3. Mount the middleware",
        body: "x402-express picks up your map and enforces per-route pricing.",
        code: {
          lang: "ts",
          content: "app.use(paymentMiddleware(process.env.PAY_TO_ADDRESS!, pricing));",
        },
      },
      {
        title: "4. Identify repeat payers",
        body: "Use the verified payer wallet as a stable user ID — no signup form required.",
      },
      {
        title: "5. Track revenue",
        body: "Hook into the on-payment event to record metrics in your analytics tool of choice.",
      },
    ],
  },
];