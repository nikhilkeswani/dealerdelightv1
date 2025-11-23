import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Gauge, 
  Fuel, 
  Settings, 
  Car,
  Search,
  SlidersHorizontal,
  Grid3x3,
  LayoutGrid,
  Sparkles,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { useState, useMemo } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: dealership, isLoading: dealershipLoading } = useQuery<Dealership>({
    queryKey: [`/api/public/dealerships/${slug}`],
    enabled: !!slug,
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: [`/api/public/dealerships/${slug}/vehicles`],
    enabled: !!slug && !!dealership,
  });

  const isLoading = dealershipLoading || vehiclesLoading;

  // Filter vehicles based on search
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    
    const query = searchQuery.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.title.toLowerCase().includes(query) ||
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.year.includes(query)
    );
  }, [vehicles, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-primary/20 animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-lg font-medium animate-pulse">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (!dealership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Car className="h-10 w-10 text-destructive" />
          </div>
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
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-4 mb-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg">
            <div className="px-6 py-4 flex items-center justify-between">
              <Link href={`/${slug}`}>
                <Button variant="ghost" size="sm" className="hover:bg-primary/5" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                {dealership.logoUrl ? (
                  <img 
                    src={dealership.logoUrl} 
                    alt={dealership.name}
                    className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
                    data-testid="img-dealership-logo"
                  />
                ) : (
                  <h1 className="text-lg font-bold gradient-text" data-testid="text-dealership-name">
                    {dealership.name}
                  </h1>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              Premium Inventory
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text" data-testid="text-page-title">
              Our Inventory
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse our premium selection of {vehicles.length} carefully curated vehicles
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by make, model, year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-background/50 backdrop-blur-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base px-4 py-2 font-semibold" data-testid="text-vehicle-count">
              {filteredVehicles.length} {filteredVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
            </Badge>
            {searchQuery && (
              <span className="text-sm text-muted-foreground">
                Filtered results
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="transition-all duration-300"
            >
              <Grid3x3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="transition-all duration-300"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {/* Vehicles Grid/List */}
        {filteredVehicles.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" 
            : "space-y-6"
          }>
            {filteredVehicles.map((vehicle, index) => (
              <Link key={vehicle.id} href={`/${slug}/vehicles/${vehicle.id}`}>
                <Card 
                  className={`group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${
                    viewMode === "grid" ? "hover:-translate-y-2" : "hover:scale-[1.02]"
                  }`}
                  data-testid={`card-vehicle-${vehicle.id}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={viewMode === "list" ? "flex flex-col sm:flex-row" : ""}>
                    {/* Image */}
                    <div className={`${viewMode === "list" ? "sm:w-80 aspect-video sm:aspect-square" : "aspect-[4/3]"} bg-muted overflow-hidden relative`}>
                      {vehicle.imageUrl ? (
                        <>
                          <img
                            src={vehicle.imageUrl}
                            alt={vehicle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            data-testid={`img-vehicle-${vehicle.id}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Car className="h-16 w-16" />
                        </div>
                      )}
                      
                      {/* Year Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-sm text-primary shadow-lg">
                          {vehicle.year}
                        </Badge>
                      </div>

                      {/* View Details Badge */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                        <Badge className="bg-primary text-white shadow-lg">
                          <ChevronRight className="h-4 w-4" />
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className={`${viewMode === "list" ? "flex-1" : ""} p-6`}>
                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <h2 className="font-bold text-xl md:text-2xl mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300" data-testid={`text-vehicle-title-${vehicle.id}`}>
                            {vehicle.title}
                          </h2>
                          <p className="text-sm md:text-base text-muted-foreground">
                            {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                        
                        {/* Specs */}
                        <div className="grid grid-cols-3 gap-3 py-4 border-y border-border">
                          <div className="flex flex-col items-center text-center group/spec">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover/spec:bg-primary/10 transition-colors duration-300">
                              <Gauge className="h-5 w-5 text-muted-foreground group-hover/spec:text-primary transition-colors duration-300" />
                            </div>
                            <span className="text-xs text-muted-foreground mb-1">Mileage</span>
                            <p className="text-xs md:text-sm font-semibold">{vehicle.mileage}</p>
                          </div>
                          <div className="flex flex-col items-center text-center group/spec">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover/spec:bg-primary/10 transition-colors duration-300">
                              <Settings className="h-5 w-5 text-muted-foreground group-hover/spec:text-primary transition-colors duration-300" />
                            </div>
                            <span className="text-xs text-muted-foreground mb-1">Trans.</span>
                            <p className="text-xs md:text-sm font-semibold">{vehicle.transmission}</p>
                          </div>
                          <div className="flex flex-col items-center text-center group/spec">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover/spec:bg-primary/10 transition-colors duration-300">
                              <Fuel className="h-5 w-5 text-muted-foreground group-hover/spec:text-primary transition-colors duration-300" />
                            </div>
                            <span className="text-xs text-muted-foreground mb-1">Fuel</span>
                            <p className="text-xs md:text-sm font-semibold">{vehicle.fuelType}</p>
                          </div>
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Price</p>
                            <p className="text-2xl md:text-3xl font-bold gradient-text" data-testid={`text-vehicle-price-${vehicle.id}`}>
                              {vehicle.price}
                            </p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
                            <ChevronRight className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-8">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-no-vehicles">
                {searchQuery ? "No Vehicles Found" : "No Vehicles Available"}
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                {searchQuery 
                  ? "Try adjusting your search criteria or browse all vehicles." 
                  : "We're currently updating our inventory. Please check back soon."}
              </p>
              {searchQuery ? (
                <Button 
                  size="lg" 
                  onClick={() => setSearchQuery("")}
                  className="px-8"
                >
                  Clear Search
                </Button>
              ) : (
                <Link href={`/${slug}`}>
                  <Button size="lg" className="px-8" data-testid="button-back-home-empty">
                    Return to Homepage
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* CTA Banner */}
      {filteredVehicles.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-primary/5 via-primary-purple/5 to-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-card border-2 border-primary/20 rounded-3xl p-8 md:p-12 shadow-xl">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Can't Find What You're Looking For?
              </h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Contact us and we'll help you find the perfect vehicle for your needs.
              </p>
              <Link href={`/${slug}`}>
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary-purple shadow-lg px-10">
                  Contact Us
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              {dealership.logoUrl && (
                <img 
                  src={dealership.logoUrl} 
                  alt={dealership.name}
                  className="h-8 w-auto object-contain opacity-60"
                />
              )}
            </div>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} {dealership.name}. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by <span className="text-primary font-semibold">DealerDelight</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
