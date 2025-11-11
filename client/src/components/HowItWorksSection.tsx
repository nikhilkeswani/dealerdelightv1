import { Sparkles, Upload, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Sparkles,
      title: "Choose Template",
      description: "Pick from Luxury, Classic, or Modern designs",
      mobileDesc: "Pick your design"
    },
    {
      icon: Upload,
      title: "Add Inventory",
      description: "Upload your vehicle listings and photos",
      mobileDesc: "Upload vehicles"
    },
    {
      icon: Rocket,
      title: "Go Live",
      description: "Launch your professional dealership website instantly",
      mobileDesc: "Launch instantly"
    }
  ];

  return (
    <section className="py-8 md:py-16 lg:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="flex md:flex-col items-start md:items-center gap-4 md:gap-4"
                data-testid={`how-it-works-step-${index + 1}`}
              >
                <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full gradient-bg flex items-center justify-center">
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div className="flex-1 md:text-center">
                  <h3 className="font-semibold text-lg md:text-xl mb-1 md:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground md:hidden">
                    {step.mobileDesc}
                  </p>
                  <p className="hidden md:block text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
