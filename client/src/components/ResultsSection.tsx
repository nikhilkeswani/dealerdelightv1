import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, Users, DollarSign } from "lucide-react";

export default function ResultsSection() {
  return (
    <section className="py-8 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-foreground">From</span>{" "}
            <span className="text-destructive">Struggling</span>
            <br />
            <span className="text-foreground">to</span>{" "}
            <span className="gradient-text-blue-purple">Thriving</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Real dealerships achieving measurable growth with DealerDelight
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center mb-8 md:mb-16">
          {/* Before */}
          <Card className="p-8 bg-gradient-to-br from-muted/50 to-card border-2">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-2 bg-destructive/10 text-destructive rounded-full text-sm font-semibold mb-4">
                Before DealerDelight
              </div>
              <h3 className="text-2xl font-bold text-foreground">Traditional Approach</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-background rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Low Online Sales</div>
                  <div className="text-sm text-muted-foreground">Only 15% of sales from online leads</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Slow Response Time</div>
                  <div className="text-sm text-muted-foreground">Average 48 hours to follow up with leads</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1">Lost Opportunities</div>
                  <div className="text-sm text-muted-foreground">60% lead conversion rate</div>
                </div>
              </div>
            </div>
          </Card>

          {/* After */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary-purple/10 border-2 border-primary/30 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-2 gradient-bg text-white rounded-full text-sm font-semibold mb-4">
                After DealerDelight
              </div>
              <h3 className="text-2xl font-bold text-foreground">Modern Platform</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-primary/20">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-purple flex items-center justify-center flex-shrink-0 shadow-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    High Online Sales
                    <span className="text-success text-sm flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +180%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">42% of sales now from online leads</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-accent/20">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    Instant Response
                    <span className="text-success text-sm flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      95% faster
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Automated responses within 2 minutes</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-primary-purple/20">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-purple to-accent-purple flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    Maximum Conversion
                    <span className="text-success text-sm flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +58%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">95% lead conversion rate with automated nurturing</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
