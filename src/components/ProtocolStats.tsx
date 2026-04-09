import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

const stats = [
  {
    label: "Transactions (30d)",
    value: "75.4M",
    change: "+18.2%",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: "Volume (30d)",
    value: "$24.2M",
    change: "+12.5%",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: "Active Buyers",
    value: "94.1K",
    change: "+23.8%",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Active Sellers",
    value: "22K",
    change: "+31.4%",
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

const ProtocolStats = () => {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="inline-block px-3 py-1 text-xs font-mono font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full mb-4">
            Protocol Growth
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            x402 by the <span className="text-gradient-primary">Numbers</span>
          </h2>
          <p className="text-muted-foreground">
            Real-time protocol metrics from the x402 network. Data sourced from{" "}
            <a href="https://www.x402.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              x402.org
            </a>.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  {stat.icon}
                </div>
                <span className="text-xs font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl md:text-3xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProtocolStats;
