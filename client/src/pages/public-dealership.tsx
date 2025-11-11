import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Mail, ArrowRight, Star, Award, Users, Car, Shield, DollarSign, Wrench, TrendingUp } from "lucide-react";
import defaultHeroImage from "@assets/stock_images/car_dealership_showr_d192fe56.jpg";

type Dealership = {
  id: string;
  name: string;
  slug: string;
  templateStyle: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
  about: string | null;
  tagline: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
};

type Vehicle = {
  id: string;
  title: string;
  year: string;
  make: string;
  model: string;
  price: string;
  imageUrl: string | null;
};

export default function PublicDealership() {
  const [match, params] = useRoute("/:slug");
  const slug = params?.slug || "";

  const { data: dealership, isLoading: dealershipLoading, error: dealershipError } = useQuery<Dealership>({
    queryKey: [`/api/public/dealerships/${slug}`],
    enabled: !!slug,
  });

  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: [`/api/public/dealerships/${slug}/vehicles`],
    enabled: !!slug && !!dealership,
  });

  if (dealershipLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dealership...</p>
        </div>
      </div>
    );
  }

  if (dealershipError || !dealership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold mb-4">Dealership Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The dealership you're looking for doesn't exist or may have been removed.
          </p>
          <Button asChild>
            <a href="/">Go to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  const featuredVehicles = vehicles.slice(0, 6);
  const heroImage = dealership.heroImageUrl || defaultHeroImage;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dealership.logoUrl ? (
                <img 
                  src={dealership.logoUrl} 
                  alt={dealership.name}
                  className="h-12 w-auto object-contain"
                  data-testid="img-dealership-logo"
                />
              ) : (
                <h1 className="text-xl font-bold" data-testid="text-dealership-name">
                  {dealership.name}
                </h1>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <Link href={`/${slug}/inventory`}>
                <Button variant="ghost" data-testid="link-inventory">
                  View Inventory
                </Button>
              </Link>
              <Button data-testid="button-contact">
                Contact Us
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Width with Overlay */}
      <section className="relative h-[550px] md:h-[650px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80"></div>
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-lg" data-testid="text-hero-title">
                {dealership.name}
              </h1>
              {dealership.tagline && (
                <p className="text-xl md:text-2xl mb-6 text-gray-100 font-light drop-shadow-md" data-testid="text-hero-tagline">
                  {dealership.tagline}
                </p>
              )}
              {dealership.address && (
                <div className="flex items-center gap-2 text-gray-200 mb-8 drop-shadow-sm">
                  <MapPin className="h-5 w-5" />
                  <span className="text-base md:text-lg">{dealership.address}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <Link href={`/${slug}/inventory`}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 shadow-xl" data-testid="button-view-inventory">
                    Browse Our Inventory
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 text-lg px-8 shadow-lg" data-testid="button-contact-hero">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-services-title">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for your automotive journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate" data-testid="card-service-sales">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Car className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Vehicle Sales</h3>
                <p className="text-muted-foreground text-sm">
                  Browse our extensive inventory of new and pre-owned vehicles
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-service-financing">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Financing</h3>
                <p className="text-muted-foreground text-sm">
                  Competitive rates and flexible financing options available
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-service-tradein">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trade-Ins</h3>
                <p className="text-muted-foreground text-sm">
                  Get the best value for your current vehicle
                </p>
              </CardContent>
            </Card>
            <Card className="hover-elevate" data-testid="card-service-maintenance">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Service & Maintenance</h3>
                <p className="text-muted-foreground text-sm">
                  Professional maintenance and repair services
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      {featuredVehicles.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3" data-testid="text-featured-vehicles">
                Featured Vehicles
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore our hand-selected premium inventory
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featuredVehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/${slug}/vehicles/${vehicle.id}`}>
                  <Card className="hover-elevate active-elevate-2 cursor-pointer h-full overflow-hidden" data-testid={`card-vehicle-${vehicle.id}`}>
                    <div className="aspect-video bg-muted overflow-hidden">
                      {vehicle.imageUrl ? (
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          data-testid={`img-vehicle-${vehicle.id}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-2">
                        <Badge variant="secondary" className="mb-2">Available Now</Badge>
                      </div>
                      <h3 className="font-bold text-xl mb-2" data-testid={`text-vehicle-title-${vehicle.id}`}>
                        {vehicle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="text-2xl font-bold text-primary" data-testid={`text-vehicle-price-${vehicle.id}`}>
                          {vehicle.price}
                        </p>
                        <Button variant="ghost" size="sm">
                          View Details
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {vehicles.length > 6 && (
              <div className="text-center">
                <Link href={`/${slug}/inventory`}>
                  <Button size="lg" variant="outline" data-testid="button-view-all">
                    View All {vehicles.length} Vehicles
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* No Vehicles State */}
      {featuredVehicles.length === 0 && !vehiclesLoading && (
        <section className="py-16 md:py-24">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Car className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Inventory Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              We're currently updating our inventory. Please check back soon or contact us for available vehicles.
            </p>
            <Button size="lg" data-testid="button-contact-no-vehicles">
              Contact Us
            </Button>
          </div>
        </section>
      )}

      {/* About Section */}
      {dealership.about && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-about-title">
              About {dealership.name}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-about">
              {dealership.about}
            </p>
          </div>
        </section>
      )}

      {/* Ready to Find Your Next Car - Contact CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-title">
              Ready to Find Your Next Car?
            </h2>
            <p className="text-lg text-muted-foreground">
              Our team is here to help you every step of the way. Visit us today!
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold mb-4">Visit our showroom</h3>
              {dealership.address && (
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Location</h4>
                    <p className="text-muted-foreground" data-testid="text-address">
                      {dealership.address}
                    </p>
                  </div>
                </div>
              )}
              {dealership.phone && (
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <a 
                      href={`tel:${dealership.phone}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid="link-phone"
                    >
                      {dealership.phone}
                    </a>
                  </div>
                </div>
              )}
              {dealership.hours && (
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Hours</h4>
                    <p className="text-muted-foreground whitespace-pre-line" data-testid="text-hours">
                      {dealership.hours}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Map or Get More Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4">Get more information</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Contact us today to learn more about our inventory, financing options, or to schedule a test drive.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/${slug}/inventory`}>
                      <Button size="lg" data-testid="button-view-inventory-cta">
                        View Inventory
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    {dealership.phone && (
                      <Button size="lg" variant="outline" asChild data-testid="button-call-now">
                        <a href={`tel:${dealership.phone}`}>
                          <Phone className="mr-2 h-5 w-5" />
                          Call Now
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
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
