import { Card } from "@/components/ui/card";
import { DollarSign, AlertTriangle, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: DollarSign,
    title: "€1,000+ for Basic Sites",
    description: "Traditional agencies charge thousands upfront for outdated WordPress sites. Updates cost extra, and you're locked into their timeline—often waiting 4-8 weeks just to go live."
  },
  {
    icon: AlertTriangle,
    title: "Separate CRM Tools",
    description: "First you build a website, then you realize you need a CRM. Now you're managing multiple platforms, paying multiple subscriptions, and manually transferring leads between systems. It's messy and inefficient."
  },
  {
    icon: TrendingDown,
    title: "Slow Websites Lose Sales",
    description: "Your website takes 5+ seconds to load. Google penalizes you, mobile shoppers leave, and tech-savvy competitors capture the customers you're losing. Every second costs you sales."
  }
];

export default function ProblemsSection() {
  return (
    <section className="py-8 md:py-24 lg:py-32 bg-gradient-to-br from-destructive/5 to-orange-500/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground">
            Tired of Expensive, Outdated Dealer Websites?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            You're not alone. Most dealerships are overpaying and underperforming with their current setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 mb-8 md:mb-12">
          {problems.map((problem, index) => (
            <Card 
              key={index}
              className="p-8 bg-card border-2 border-destructive/20 hover-elevate transition-all"
              data-testid={`problem-card-${index}`}
            >
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-destructive/10 to-orange-500/10 flex items-center justify-center border-2 border-destructive/30">
                  <problem.icon className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 text-center">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-center">
                {problem.description}
              </p>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-2xl md:text-3xl font-semibold text-foreground">
            There's a better way...
          </p>
        </div>
      </div>
    </section>
  );
}
