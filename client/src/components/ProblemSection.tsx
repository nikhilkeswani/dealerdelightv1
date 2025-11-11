import { DollarSign, Boxes, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const problems = [
  {
    icon: DollarSign,
    title: "Expensive Agencies",
    description: "Paying $5,000+ for a basic website that takes months to build and costs extra for every update."
  },
  {
    icon: Boxes,
    title: "Separate CRM Systems",
    description: "Juggling multiple tools for inventory, customer management, and your website - nothing works together."
  },
  {
    icon: Zap,
    title: "Slow, Outdated Sites",
    description: "Your website loads slowly, looks outdated, and doesn't showcase your inventory the way modern buyers expect."
  }
];

export default function ProblemSection() {
  return (
    <section className="py-20 md:py-28 lg:py-36 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl lg:text-5xl mb-6">
            The Problems Dealers Face
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Running a successful dealership is hard enough without technology holding you back
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {problems.map((problem, index) => (
            <Card 
              key={index} 
              className="p-10 hover-elevate active-elevate-2 transition-all border"
              data-testid={`card-problem-${index}`}
            >
              <div className="flex justify-center mb-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <problem.icon className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="font-medium text-lg md:text-xl mb-4 text-center">{problem.title}</h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                {problem.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
