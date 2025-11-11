import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";

type TemplateType = 'luxury' | 'professional' | 'dynamic';

export default function InstantPreviewSection() {
  const [dealershipName, setDealershipName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('professional');
  
  const displayName = dealershipName.trim() || "Your Dealership";
  
  // Sanitize name for URL: lowercase alphanumeric and hyphens only
  const sanitizedDomain = displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'yourdealership';

  const templateStyles = {
    luxury: {
      name: "Luxury Elite",
      headerBg: "bg-gradient-to-r from-[hsl(0_0%_0%)] to-[hsl(30_40%_25%)]",
      headerText: "text-white",
      logoBg: "bg-gradient-to-br from-[hsl(45_100%_70%)] to-[hsl(35_90%_50%)]/40",
      heroBg: "bg-gradient-to-br from-[hsl(0_0%_5%)] to-[hsl(25_35%_20%)]",
      heroTitle: "bg-gradient-to-r from-[hsl(45_100%_70%)] to-[hsl(35_90%_50%)] bg-clip-text text-transparent",
      heroText: "text-gray-300",
      ctaBg: "bg-gradient-to-r from-[hsl(45_100%_65%)] to-[hsl(35_90%_50%)]",
      ctaText: "text-black",
      cardBg: "bg-[hsl(0_0%_12%)]",
      cardBorder: "border-[hsl(45_100%_65%)]/20",
      priceColor: "bg-gradient-to-r from-[hsl(45_100%_70%)] to-[hsl(35_90%_50%)] bg-clip-text text-transparent",
      footerBg: "bg-gradient-to-r from-[hsl(0_0%_3%)] to-[hsl(15_30%_18%)]",
      footerText: "text-gray-400"
    },
    professional: {
      name: "Classic Pro",
      headerBg: "bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)]",
      headerText: "text-white",
      logoBg: "bg-white/20",
      heroBg: "bg-gradient-to-br from-[hsl(220_85%_96%)] to-[hsl(260_75%_96%)]",
      heroTitle: "bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)] bg-clip-text text-transparent",
      heroText: "text-[hsl(220_40%_35%)]",
      ctaBg: "bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)]",
      ctaText: "text-white",
      cardBg: "bg-white",
      cardBorder: "border-[hsl(220_30%_88%)]",
      priceColor: "bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)] bg-clip-text text-transparent",
      footerBg: "bg-gradient-to-r from-[hsl(220_85%_96%)] to-[hsl(260_75%_96%)]",
      footerText: "text-[hsl(220_40%_45%)]"
    },
    dynamic: {
      name: "Modern Edge",
      headerBg: "bg-gradient-to-r from-[hsl(25_95%_55%)] to-[hsl(190_95%_55%)]",
      headerText: "text-white",
      logoBg: "bg-white/20",
      heroBg: "bg-gradient-to-br from-[hsl(25_95%_95%)] to-[hsl(190_95%_95%)]",
      heroTitle: "bg-gradient-to-r from-[hsl(25_95%_50%)] to-[hsl(190_95%_50%)] bg-clip-text text-transparent",
      heroText: "text-[hsl(220_10%_40%)]",
      ctaBg: "bg-gradient-to-r from-[hsl(25_95%_55%)] to-[hsl(190_95%_55%)]",
      ctaText: "text-white",
      cardBg: "bg-white",
      cardBorder: "border-[hsl(25_95%_55%)]/20",
      priceColor: "bg-gradient-to-r from-[hsl(25_95%_50%)] to-[hsl(190_95%_50%)] bg-clip-text text-transparent",
      footerBg: "bg-gradient-to-r from-[hsl(25_95%_96%)] to-[hsl(190_95%_96%)]",
      footerText: "text-[hsl(220_10%_50%)]"
    }
  };

  const currentStyle = templateStyles[selectedTemplate];

  const scrollToSignup = () => {
    const signupSection = document.getElementById('signup-section');
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="instant-preview" className="py-8 md:py-20 lg:py-28 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Try It Instantly</span>
          </div>
          <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="gradient-text-blue-purple">See Your Dealership Online</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Type your dealership name below and watch your website come to life in real-time
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Input
              type="text"
              placeholder="Enter your dealership name (e.g., Mike's Auto Sales)"
              value={dealershipName}
              onChange={(e) => setDealershipName(e.target.value)}
              className="h-14 md:h-16 text-lg px-6 border-2 focus:border-primary text-center font-semibold"
              data-testid="input-preview-dealership-name"
            />
          </div>

          {/* Template Switcher */}
          <div className="flex justify-center gap-3 mb-6">
            <Button
              variant={selectedTemplate === 'luxury' ? 'default' : 'outline'}
              onClick={() => setSelectedTemplate('luxury')}
              className={selectedTemplate === 'luxury' ? 'bg-gradient-to-r from-[hsl(0_0%_0%)] to-[hsl(30_40%_25%)] text-[hsl(45_100%_70%)]' : ''}
              data-testid="button-template-luxury"
            >
              Luxury Elite
            </Button>
            <Button
              variant={selectedTemplate === 'professional' ? 'default' : 'outline'}
              onClick={() => setSelectedTemplate('professional')}
              className={selectedTemplate === 'professional' ? 'bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)]' : ''}
              data-testid="button-template-professional"
            >
              Classic Pro
            </Button>
            <Button
              variant={selectedTemplate === 'dynamic' ? 'default' : 'outline'}
              onClick={() => setSelectedTemplate('dynamic')}
              className={selectedTemplate === 'dynamic' ? 'bg-gradient-to-r from-[hsl(25_95%_55%)] to-[hsl(190_95%_55%)]' : ''}
              data-testid="button-template-dynamic"
            >
              Modern Edge
            </Button>
          </div>

          <Card className="overflow-hidden shadow-2xl border-2" data-testid="card-preview-mockup">
            {/* Browser Chrome */}
            <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/60"></div>
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background/80 rounded px-3 py-1 text-xs text-muted-foreground">
                  {sanitizedDomain}.dealerdelight.com
                </div>
              </div>
            </div>

            {/* Website Preview */}
            <div className={selectedTemplate === 'luxury' ? '' : 'bg-white'}>
              {/* Header */}
              <div className={`border-b px-6 py-4 flex items-center justify-between ${currentStyle.headerBg} ${currentStyle.headerText}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full ${currentStyle.logoBg} flex items-center justify-center font-bold text-sm`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-lg">{displayName}</span>
                </div>
                <div className="hidden md:flex gap-6 text-sm">
                  <span>Inventory</span>
                  <span>About</span>
                  <span>Contact</span>
                </div>
              </div>

              {/* Hero Section */}
              <div className={`${currentStyle.heroBg} px-6 py-12 text-center`}>
                <h1 className={`font-bold text-3xl md:text-4xl mb-4 ${currentStyle.heroTitle}`}>
                  Welcome to {displayName}
                </h1>
                <p className={`${currentStyle.heroText} text-lg max-w-2xl mx-auto mb-6`}>
                  Your trusted partner for quality vehicles
                </p>
                <div className={`inline-block ${currentStyle.ctaBg} ${currentStyle.ctaText} px-6 py-2 rounded-md text-sm font-semibold`}>
                  Browse Inventory
                </div>
              </div>

              {/* Sample Vehicle Card */}
              <div className="px-6 py-8">
                <h3 className={`font-semibold text-xl mb-4 ${selectedTemplate === 'luxury' ? 'bg-gradient-to-r from-[hsl(45_100%_70%)] to-[hsl(35_90%_50%)] bg-clip-text text-transparent' : selectedTemplate === 'professional' ? 'bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)] bg-clip-text text-transparent' : 'text-[hsl(25_95%_55%)]'}`}>Featured Vehicles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`border ${currentStyle.cardBorder} rounded-lg overflow-hidden hover-elevate`}>
                    <img 
                      src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80" 
                      alt="Live dealership website preview featuring 2024 BMW M3 in inventory showcase"
                      className="aspect-video w-full object-cover"
                    />
                    <div className={`p-3 ${currentStyle.cardBg}`}>
                      <div className="font-semibold text-sm mb-1">2024 BMW M3</div>
                      <div className={`font-bold ${currentStyle.priceColor}`}>$82,900</div>
                      <div className={`text-xs ${selectedTemplate === 'luxury' ? 'text-gray-400' : 'text-muted-foreground'}`}>1,200 mi • Automatic</div>
                    </div>
                  </div>
                  <div className={`border ${currentStyle.cardBorder} rounded-lg overflow-hidden hover-elevate`}>
                    <img 
                      src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80" 
                      alt="Live dealership website preview featuring 2023 Mercedes C-Class luxury vehicle"
                      className="aspect-video w-full object-cover"
                    />
                    <div className={`p-3 ${currentStyle.cardBg}`}>
                      <div className="font-semibold text-sm mb-1">2023 Mercedes C-Class</div>
                      <div className={`font-bold ${currentStyle.priceColor}`}>$54,500</div>
                      <div className={`text-xs ${selectedTemplate === 'luxury' ? 'text-gray-400' : 'text-muted-foreground'}`}>8,500 mi • Hybrid</div>
                    </div>
                  </div>
                  <div className={`border ${currentStyle.cardBorder} rounded-lg overflow-hidden hover-elevate`}>
                    <img 
                      src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&auto=format&fit=crop&q=80" 
                      alt="Live dealership website preview featuring 2024 Audi Q5 premium SUV"
                      className="aspect-video w-full object-cover"
                    />
                    <div className={`p-3 ${currentStyle.cardBg}`}>
                      <div className="font-semibold text-sm mb-1">2024 Audi Q5</div>
                      <div className={`font-bold ${currentStyle.priceColor}`}>$49,900</div>
                      <div className={`text-xs ${selectedTemplate === 'luxury' ? 'text-gray-400' : 'text-muted-foreground'}`}>2,100 mi • Automatic</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`border-t px-6 py-4 ${currentStyle.footerBg} text-center text-sm ${currentStyle.footerText}`}>
                © 2024 {displayName}. All rights reserved.
              </div>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={scrollToSignup}
              className="gradient-bg text-white px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              data-testid="button-create-website"
            >
              Create My Full Website
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • See results instantly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
