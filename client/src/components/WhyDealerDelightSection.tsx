import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DollarSign, AlertTriangle, TrendingDown, TrendingUp, Clock, Users } from "lucide-react";

const benefits = [
  {
    problem: {
      icon: DollarSign,
      title: "€1,000+ for Basic Sites",
      description: "Traditional agencies charge thousands upfront for outdated sites"
    },
    solution: {
      title: "+180% Online Sales",
      stat: "$219/month",
      description: "Get a modern dealership website and CRM for less than your coffee budget"
    }
  },
  {
    problem: {
      icon: Clock,
      title: "Slow Response Times",
      description: "48-hour delays lose hot leads to competitors"
    },
    solution: {
      title: "Instant Response",
      stat: "2 minutes",
      description: "Automated lead responses and nurturing capture every opportunity"
    }
  },
  {
    problem: {
      icon: AlertTriangle,
      title: "Scattered Tools",
      description: "Managing multiple platforms wastes time and money"
    },
    solution: {
      title: "All-in-One Platform",
      stat: "95%",
      description: "Website, CRM, and lead management in one seamless system"
    }
  }
];

export default function WhyDealerDelightSection() {
  return (
    <section className="py-8 md:py-20 lg:py-24 bg-gradient-to-br from-primary/5 to-primary-purple/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="font-bold text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6">
            <span className="text-foreground">From</span>{" "}
            <span className="text-destructive">Struggling</span>
            <br className="hidden md:block" />
            <span className="text-foreground"> to </span>
            <span className="gradient-text-blue-purple">Thriving</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg lg:text-xl max-w-3xl mx-auto">
            Real dealerships achieving measurable growth with DealerDelight
          </p>
        </div>

        {/* Mobile: Accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="space-y-4">
            {benefits.map((benefit, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border rounded-lg bg-card"
                data-testid={`why-accordion-${index}`}
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <benefit.problem.icon className="h-5 w-5 text-destructive" />
                    <span className="font-semibold text-left">{benefit.problem.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {benefit.problem.description}
                    </p>
                    <div className="pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="font-semibold text-success">{benefit.solution.title}</span>
                      </div>
                      <div className="text-2xl font-bold gradient-text-blue-purple mb-1">
                        {benefit.solution.stat}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {benefit.solution.description}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Desktop: Two-column cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="p-6 hover-elevate transition-all"
              data-testid={`why-card-${index}`}
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-3">
                  <benefit.problem.icon className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-destructive">
                  {benefit.problem.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {benefit.problem.description}
                </p>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-semibold text-success text-sm">{benefit.solution.title}</span>
                </div>
                <div className="text-3xl font-bold gradient-text-blue-purple mb-2">
                  {benefit.solution.stat}
                </div>
                <p className="text-sm text-muted-foreground">
                  {benefit.solution.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
