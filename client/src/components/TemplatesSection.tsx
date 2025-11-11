import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Eye } from "lucide-react";
import classicTemplate from "@assets/generated_images/Classic_dealership_website_template_404ca4c1.png";
import premiumTemplate from "@assets/generated_images/Premium_dealership_website_template_f1aa2205.png";
import modernTemplate from "@assets/generated_images/Modern_dealership_website_template_e9a910bd.png";

const templates = [
  {
    name: "Classic Pro",
    image: classicTemplate,
    description: "Clean and professional design perfect for traditional dealerships",
    gradient: "from-primary/20 to-accent/20"
  },
  {
    name: "Luxury Elite",
    image: premiumTemplate,
    description: "Premium dark theme ideal for luxury and high-end vehicle brands",
    gradient: "from-primary-purple/20 to-primary/20"
  },
  {
    name: "Modern Edge",
    image: modernTemplate,
    description: "Contemporary design with bold colors for forward-thinking dealers",
    gradient: "from-accent/20 to-primary-purple/20"
  }
];

export default function TemplatesSection() {
  const [, setLocation] = useLocation();

  return (
    <section id="templates" className="py-8 md:py-20 lg:py-28 gradient-bg-subtle">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="gradient-text-blue-purple">Professional Templates</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Launch your dealership website in minutes with stunning templates designed for conversion
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {templates.map((template, index) => (
            <Card 
              key={index} 
              className={`overflow-hidden hover-elevate active-elevate-2 transition-all border-2 group bg-gradient-to-br ${template.gradient} shadow-xl`}
              data-testid={`card-template-${index}`}
            >
              <div className="relative aspect-video overflow-hidden bg-card">
                <img 
                  src={template.image} 
                  alt={`Premium auto dealership website template - ${template.name} design for car dealers`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <Button 
                    variant="default"
                    className="gradient-bg text-white shadow-2xl"
                    onClick={() => setLocation('/demo')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
              <div className="p-8 bg-white">
                <h3 className="font-semibold text-xl mb-3 text-foreground">{template.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{template.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
