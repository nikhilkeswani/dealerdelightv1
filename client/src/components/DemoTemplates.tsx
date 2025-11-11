import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, DollarSign, Gauge, Fuel } from "lucide-react";

// Mock vehicle data for demos
const vehicles = [
  {
    id: 1,
    name: "2024 BMW M3 Competition",
    price: "$82,900",
    year: "2024",
    mileage: "1,200 mi",
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"
  },
  {
    id: 2,
    name: "2023 Mercedes-Benz C-Class",
    price: "$54,500",
    year: "2023",
    mileage: "8,500 mi",
    fuel: "Hybrid",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"
  },
  {
    id: 3,
    name: "2024 Audi Q5 Premium",
    price: "$49,900",
    year: "2024",
    mileage: "2,100 mi",
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"
  },
  {
    id: 4,
    name: "2023 Tesla Model Y",
    price: "$52,900",
    year: "2023",
    mileage: "5,200 mi",
    fuel: "Electric",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80"
  },
  {
    id: 5,
    name: "2024 Porsche Cayenne",
    price: "$89,900",
    year: "2024",
    mileage: "850 mi",
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80"
  },
  {
    id: 6,
    name: "2023 Range Rover Sport",
    price: "$94,500",
    year: "2023",
    mileage: "3,800 mi",
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80"
  }
];

interface DemoTemplateProps {
  variant: 'classic' | 'luxury' | 'modern';
}

export default function DemoTemplates({ variant }: DemoTemplateProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);

  const getVariantStyles = () => {
    switch (variant) {
      case 'luxury':
        return {
          bg: 'bg-[hsl(0_0%_5%)]',
          text: 'text-white',
          accent: 'text-[hsl(45_100%_65%)]',
          cardBg: 'bg-[hsl(0_0%_10%)]',
          border: 'border-[hsl(45_100%_65%)]/20'
        };
      case 'modern':
        return {
          bg: 'bg-background',
          text: 'text-foreground',
          accent: 'text-[hsl(25_95%_55%)]',
          cardBg: 'bg-card',
          border: 'border-border'
        };
      default:
        return {
          bg: 'bg-background',
          text: 'text-foreground',
          accent: 'text-primary',
          cardBg: 'bg-card',
          border: 'border-border'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className={`font-heading font-bold text-4xl md:text-5xl mb-4 ${styles.accent}`}>
            Our Premium Inventory
          </h1>
          <p className="text-xl opacity-80">
            Browse our selection of quality pre-owned and new vehicles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={`overflow-hidden hover-elevate active-elevate-2 transition-all ${styles.cardBg} ${styles.border}`}
              onClick={() => setSelectedVehicle(vehicle.id)}
              data-testid={`card-vehicle-${vehicle.id}`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <Badge className={`absolute top-3 right-3 ${variant === 'luxury' ? 'bg-[hsl(45_100%_65%)] text-black' : ''}`}>
                  {vehicle.year}
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-2">{vehicle.name}</h3>
                <p className={`text-2xl font-bold mb-4 ${styles.accent}`}>{vehicle.price}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm opacity-80">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    <span>{vehicle.mileage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4" />
                    <span>{vehicle.fuel}</span>
                  </div>
                </div>
                
                <Button 
                  className={`w-full ${variant === 'luxury' ? 'bg-[hsl(45_100%_65%)] text-black hover:bg-[hsl(45_100%_60%)]' : variant === 'modern' ? 'bg-[hsl(25_95%_55%)] hover:bg-[hsl(25_95%_50%)]' : ''}`}
                  data-testid={`button-view-details-${vehicle.id}`}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
