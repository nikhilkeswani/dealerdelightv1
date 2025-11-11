import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gauge, Fuel, Settings } from "lucide-react";

type Dealership = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

type Vehicle = {
  id: string;
  title: string;
  year: string;
  make: string;
  model: string;
  price: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  imageUrl: string | null;
};

export default function PublicInventory() {
  const [match, params] = useRoute("/:slug/inventory");
  const slug = params?.slug || "";

  const { data: dealership, isLoading: dealershipLoading } = useQuery<Dealership>({
    queryKey: [`/api/public/dealerships/${slug}`],
    enabled: !!slug,
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: [`/api/public/dealerships/${slug}/vehicles`],
    enabled: !!slug && !!dealership,
  });

  const isLoading = dealershipLoading || vehiclesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!dealership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold mb-4">Dealership Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The dealership you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href={`/${slug}`}>
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              {dealership.logoUrl ? (
                <img 
                  src={dealership.logoUrl} 
                  alt={dealership.name}
                  className="h-10 w-auto object-contain"
                  data-testid="img-dealership-logo"
                />
              ) : (
                <h1 className="text-lg font-bold" data-testid="text-dealership-name">
                  {dealership.name}
                </h1>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" data-testid="text-page-title">
            Our Inventory
          </h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base px-3 py-1" data-testid="text-vehicle-count">
              {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Available
            </Badge>
            <p className="text-muted-foreground">
              Browse our premium selection
            </p>
          </div>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/${slug}/vehicles/${vehicle.id}`}>
                <Card className="hover-elevate active-elevate-2 cursor-pointer h-full overflow-hidden group" data-testid={`card-vehicle-${vehicle.id}`}>
                  <div className="aspect-video bg-muted overflow-hidden">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        data-testid={`img-vehicle-${vehicle.id}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image Available
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-3">
                      <Badge variant="secondary" className="mb-2">
                        {vehicle.year}
                      </Badge>
                    </div>
                    <h2 className="font-bold text-xl mb-2 line-clamp-1" data-testid={`text-vehicle-title-${vehicle.id}`}>
                      {vehicle.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {vehicle.make} {vehicle.model}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b">
                      <div className="flex flex-col items-center text-center">
                        <Gauge className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Mileage</span>
                        <p className="text-xs font-medium mt-1">{vehicle.mileage}</p>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <Settings className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Trans.</span>
                        <p className="text-xs font-medium mt-1">{vehicle.transmission}</p>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <Fuel className="h-4 w-4 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Fuel</span>
                        <p className="text-xs font-medium mt-1">{vehicle.fuelType}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-primary" data-testid={`text-vehicle-price-${vehicle.id}`}>
                        {vehicle.price}
                      </p>
                      <Button variant="ghost" size="sm" className="text-primary">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Settings className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4" data-testid="text-no-vehicles">
                No Vehicles Available
              </h2>
              <p className="text-muted-foreground mb-6">
                We're currently updating our inventory. Please check back soon or contact us directly for available vehicles.
              </p>
              <Link href={`/${slug}`}>
                <Button size="lg" data-testid="button-back-home-empty">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              © {new Date().getFullYear()} {dealership.name}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by <span className="text-primary font-medium">DealerDelight</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
