import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, DollarSign } from "lucide-react";

export default function HeroSection() {
  const goToSignup = () => {
    window.location.href = '/signup';
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary-purple/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Headline & CTA */}
          <div className="text-center lg:text-left">
            <h1 className="font-bold text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight">
              <span className="gradient-text-blue-purple">
                Modern Websites & CRM
              </span>
              <br />
              <span className="text-foreground">for Auto Dealerships</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The complete platform to sell more cars online. Beautiful websites, powerful CRM, and seamless inventory management — all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Button 
                size="lg" 
                className="gradient-bg text-white px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-xl transition-all hover:scale-105 group"
                onClick={goToSignup}
                data-testid="button-hero-cta"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground">
                14 days free • No credit card required
              </p>
            </div>
          </div>

          {/* Right: Complete Platform Preview */}
          <div className="relative hidden lg:block">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-border">
              {/* Platform Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Your Complete Platform</h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent/30"></div>
                  <div className="w-3 h-3 rounded-full bg-primary-purple/30"></div>
                  <div className="w-3 h-3 rounded-full bg-success/30"></div>
                </div>
              </div>

              {/* Website Preview Section */}
              <div className="mb-6 bg-gradient-to-br from-muted/40 to-card rounded-xl p-4 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-destructive/40"></div>
                    <div className="w-2 h-2 rounded-full bg-primary-purple/40"></div>
                    <div className="w-2 h-2 rounded-full bg-success/40"></div>
                  </div>
                  <div className="flex-1 bg-muted/60 rounded px-2 py-1 text-xs text-muted-foreground">
                    yourdealership.com
                  </div>
                </div>
                <div className="h-16 bg-gradient-to-r from-primary/20 to-primary-purple/20 rounded-lg flex items-center justify-center">
                  <div className="text-sm font-bold gradient-text-blue-purple">Your Dealership Website</div>
                </div>
              </div>

              {/* Platform Capabilities Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary-purple/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                      <Users className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-foreground">47</div>
                  <div className="text-xs text-muted-foreground">CRM Leads</div>
                </div>

                <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-accent" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-foreground">156</div>
                  <div className="text-xs text-muted-foreground">Inventory</div>
                </div>

                <div className="bg-gradient-to-br from-primary-purple/10 to-accent-purple/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded bg-primary-purple/20 flex items-center justify-center">
                      <DollarSign className="h-3 w-3 text-primary-purple" />
                    </div>
                  </div>
                  <div className="text-lg font-bold text-foreground">$890K</div>
                  <div className="text-xs text-muted-foreground">Analytics</div>
                </div>
              </div>

              {/* Activity Chart */}
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-3 h-24 flex items-end gap-1.5">
                <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t" style={{height: '40%'}}></div>
                <div className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t" style={{height: '65%'}}></div>
                <div className="flex-1 bg-gradient-to-t from-accent to-accent/60 rounded-t" style={{height: '85%'}}></div>
                <div className="flex-1 bg-gradient-to-t from-accent to-accent/60 rounded-t" style={{height: '70%'}}></div>
                <div className="flex-1 bg-gradient-to-t from-primary-purple to-primary-purple/60 rounded-t" style={{height: '95%'}}></div>
                <div className="flex-1 bg-gradient-to-t from-primary-purple to-primary-purple/60 rounded-t" style={{height: '100%'}}></div>
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary to-primary-purple rounded-2xl opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-accent to-primary-purple rounded-2xl opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
