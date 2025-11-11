import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const features = [
  "Professional website templates",
  "Built-in CRM & lead management",
  "Unlimited vehicle listings",
  "Mobile-responsive design",
  "Analytics & reporting dashboard",
  "Priority customer support"
];

export default function PricingSection() {
  const goToSignup = () => {
    window.location.href = '/signup';
  };

  return (
    <section id="pricing" className="py-8 md:py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="gradient-text-blue-purple">Simple Pricing</span>
            <br />
            <span className="text-foreground">Powerful Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Everything you need to run your dealership online. One price, all features included.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto">
          <Card className="p-8 md:p-10 border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-primary/5 to-primary-purple/5" data-testid="card-pricing">
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-primary text-white rounded-full text-sm font-semibold shadow-lg">
                <Sparkles className="h-4 w-4" />
                Launch Special
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="mb-4">
                <div className="text-sm text-muted-foreground line-through mb-1">Regular Price: €249/month</div>
                <div>
                  <span className="text-6xl md:text-7xl font-bold gradient-text-blue-purple">€199</span>
                  <span className="text-muted-foreground text-2xl">/month</span>
                </div>
              </div>
              <div className="inline-block bg-success/10 text-success px-4 py-2 rounded-lg text-sm font-semibold mb-3">
                Save €600/year • Lock in forever
              </div>
              <p className="text-muted-foreground text-sm">First 50 dealerships only. All features included.</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3" data-testid={`feature-item-${index}`}>
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary-purple flex items-center justify-center shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-foreground font-medium text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              className="w-full gradient-bg text-white py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              onClick={goToSignup}
              data-testid="button-start-trial"
            >
              Start Free Trial
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Early adopters keep €199 rate permanently
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
