import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const goToSignup = () => {
    window.location.href = '/signup';
  };

  return (
    <section className="py-8 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center">
          <h3 className="font-bold text-3xl md:text-4xl lg:text-5xl mb-6 gradient-text-blue-purple">
            Ready to Transform Your Dealership?
          </h3>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Start selling more cars online with DealerDelight
          </p>
          <Button 
            size="lg"
            className="gradient-bg text-white px-10 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            onClick={goToSignup}
            data-testid="button-get-started"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
