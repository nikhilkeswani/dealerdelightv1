import { Palette, Package, Users } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Beautiful Templates",
    description: "Choose from professionally designed templates built specifically for auto dealerships. Go live in minutes, not months."
  },
  {
    icon: Package,
    title: "Inventory Management",
    description: "Easily add, update, and showcase your vehicles. Automatic photo optimization and instant updates across your site."
  },
  {
    icon: Users,
    title: "Built-in CRM",
    description: "Track leads, manage customer relationships, and follow up automatically. Everything you need in one integrated platform."
  }
];

export default function SolutionSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            DealerDelight combines website, CRM, and inventory management into one powerful, easy-to-use system
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center" data-testid={`feature-${index}`}>
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-[hsl(25_95%_55%)]/10 flex items-center justify-center">
                  <feature.icon className="h-10 w-10 text-[hsl(25_95%_55%)]" />
                </div>
              </div>
              <h3 className="font-semibold text-2xl mb-4">{feature.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
