import { Card } from "@/components/ui/card";
import { Palette, Package, Users, BarChart, Zap, Shield } from "lucide-react";
import dashboardImage from "@assets/stock_images/modern_clean_compute_e4111ced.jpg";
import analyticsImage from "@assets/stock_images/modern_clean_compute_71d2de48.jpg";

const features = [
  {
    icon: Palette,
    title: "Beautiful Templates",
    description: "Launch your dealership website in minutes with professionally designed templates built for conversion.",
    image: dashboardImage,
    altText: "Auto dealership website builder dashboard showing professional template designs"
  },
  {
    icon: Package,
    title: "Smart Inventory",
    description: "Manage your entire vehicle inventory with automatic photo optimization and real-time updates across all platforms.",
    image: analyticsImage,
    altText: "Auto dealership inventory management system with vehicle listings and analytics"
  },
  {
    icon: Users,
    title: "Integrated CRM",
    description: "Track every lead, manage customer relationships, and automate follow-ups—all in one powerful platform."
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    description: "Get insights into your best-selling vehicles, top-performing listings, and conversion metrics in real-time."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with instant page loads and seamless navigation to keep buyers engaged."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime and automatic backups to protect your business data."
  }
];

export default function ProductShowcase() {
  return (
    <section className="py-20 md:py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
            Everything You Need to Sell More Cars
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            All the tools to run your dealership online in one powerful, easy-to-use platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {features.slice(0, 2).map((feature, index) => (
            <Card key={index} className="overflow-hidden hover-elevate active-elevate-2 transition-all border" data-testid={`feature-card-${index}`}>
              <div className="aspect-video overflow-hidden bg-muted/30">
                <img 
                  src={feature.image} 
                  alt={feature.altText || feature.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-medium text-xl md:text-2xl">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.slice(2).map((feature, index) => (
            <Card key={index + 2} className="p-8 hover-elevate active-elevate-2 transition-all border" data-testid={`feature-card-${index + 2}`}>
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-medium text-base md:text-lg mb-3 text-center">{feature.title}</h3>
              <p className="text-muted-foreground text-sm text-center leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
