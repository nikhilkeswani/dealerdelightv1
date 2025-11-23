import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  ArrowRight, 
  Star, 
  Award, 
  Users, 
  Car, 
  Shield, 
  DollarSign, 
  Wrench, 
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from "lucide-react";
// Hero uses pure gradient - no default image needed

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
  
  // Customizable stats
  statsYearsInBusiness: number | null;
  statsTotalClients: number | null;
  statsRating: string | null;
  statsShowVehicleCount: string | null;
  
  // Services
  servicesEnabled: string | null;
  servicesData: {
    services: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  } | null;
  
  // Section visibility
  showStatsSection: string | null;
  showServicesSection: string | null;
  showAboutSection: string | null;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-primary/20 animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-lg font-medium animate-pulse">Loading dealership...</p>
        </div>
      </div>
    );
  }

  if (dealershipError || !dealership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Car className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Dealership Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The dealership you're looking for doesn't exist or may have been removed.
          </p>
          <Button asChild size="lg">
            <a href="/">Go to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  const featuredVehicles = vehicles.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Header - Modern & Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-4 mb-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {dealership.logoUrl ? (
                  <img 
                    src={dealership.logoUrl} 
                    alt={dealership.name}
                    className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
                    data-testid="img-dealership-logo"
                  />
                ) : (
                  <h1 className="text-xl font-bold gradient-text" data-testid="text-dealership-name">
                    {dealership.name}
                  </h1>
                )}
              </div>
              <nav className="hidden md:flex items-center gap-2">
                <Link href={`/${slug}/inventory`}>
                  <Button variant="ghost" className="hover:bg-primary/5" data-testid="link-inventory">
                    <Car className="mr-2 h-4 w-4" />
                    Inventory
                  </Button>
                </Link>
                <Button className="bg-gradient-to-r from-primary to-primary-purple shadow-lg shadow-primary/20 border-0" data-testid="button-contact">
                  Contact Us
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Pure Gradient Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Custom Hero Image or Classic Pro Gradient */}
        {dealership.heroImageUrl ? (
          // If dealer uploaded custom image, show it with overlay
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${dealership.heroImageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_85%_60%)]/85 via-[hsl(240_80%_62%)]/80 to-[hsl(260_75%_65%)]/85"></div>
            </div>
          </>
        ) : (
          // Pure gradient background - Classic Pro colors
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_85%_60%)] via-[hsl(240_80%_65%)] to-[hsl(260_75%_65%)]">
              {/* Mesh gradient overlay for depth */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(220_90%_70%)_0%,transparent_50%)] opacity-40"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(260_80%_70%)_0%,transparent_50%)] opacity-40"></div>
              {/* Animated shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            </div>
          </>
        )}
        
        {/* Bottom fade to background */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 w-full pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/30 mb-6 animate-fade-in shadow-lg shadow-[hsl(220_85%_60%)]/20">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                <span className="text-sm font-medium text-white">Premium Automotive Excellence</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] text-white drop-shadow-2xl animate-fade-in-up" data-testid="text-hero-title">
                {dealership.name}
              </h1>
              
              {dealership.tagline && (
                <p className="text-xl md:text-3xl mb-8 text-white/90 font-light drop-shadow-lg max-w-2xl animate-fade-in-up animation-delay-200" data-testid="text-hero-tagline">
                  {dealership.tagline}
                </p>
              )}

              {/* Location */}
              {dealership.address && (
                <div className="flex items-center gap-3 text-white/80 mb-10 animate-fade-in-up animation-delay-300">
                  <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-base md:text-lg">{dealership.address}</span>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-400">
                <Link href={`/${slug}/inventory`}>
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105" 
                    data-testid="button-view-inventory"
                  >
                    Browse Inventory
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6 h-auto shadow-xl transition-all duration-300 hover:scale-105" 
                  data-testid="button-contact-hero"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-12 w-8 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="h-2 w-2 rounded-full bg-white/80"></div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Floating */}
      {(() => {
        // Check if user has explicitly configured any stats
        const hasConfiguredStats = dealership.statsRating || 
                                   dealership.statsTotalClients || 
                                   dealership.statsYearsInBusiness;
        
        // Only show the stats section if:
        // 1. User hasn't disabled it (showStatsSection !== 'false')
        // 2. User has configured at least ONE stat (years, clients, or rating)
        // This ensures an "empty" customization doesn't show just vehicle count by default
        if (dealership.showStatsSection === 'false' || !hasConfiguredStats) {
          return null;
        }
        
        return (
          <section className="-mt-16 relative z-20 mb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className={`grid ${[
                  dealership.statsShowVehicleCount !== 'false',
                  dealership.statsRating,
                  dealership.statsTotalClients,
                  dealership.statsYearsInBusiness
                ].filter(Boolean).length > 2 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'} divide-x divide-border`}>
                
                {/* Vehicle Count */}
                {dealership.statsShowVehicleCount !== 'false' && (
                  <div className="p-6 text-center hover:bg-muted/50 transition-all duration-300 group">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{vehicles.length}+</p>
                    <p className="text-sm text-muted-foreground">Vehicles</p>
                  </div>
                )}
                
                {/* Rating */}
                {dealership.statsRating && (
                  <div className="p-6 text-center hover:bg-muted/50 transition-all duration-300 group">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{dealership.statsRating}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                )}
                
                {/* Total Clients */}
                {dealership.statsTotalClients && (
                  <div className="p-6 text-center hover:bg-muted/50 transition-all duration-300 group">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{dealership.statsTotalClients.toLocaleString()}+</p>
                    <p className="text-sm text-muted-foreground">Happy Clients</p>
                  </div>
                )}
                
                {/* Years in Business */}
                {dealership.statsYearsInBusiness && (
                  <div className="p-6 text-center hover:bg-muted/50 transition-all duration-300 group">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{dealership.statsYearsInBusiness}+</p>
                    <p className="text-sm text-muted-foreground">Years</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Featured Vehicles - Modern Grid */}
      {featuredVehicles.length > 0 && (
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 px-4 py-2 text-sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Premium Selection
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text" data-testid="text-featured-vehicles">
                Featured Vehicles
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore our hand-selected collection of premium vehicles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {featuredVehicles.map((vehicle, index) => (
                <Link key={vehicle.id} href={`/${slug}/vehicles/${vehicle.id}`}>
                  <Card 
                    className="group cursor-pointer h-full overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2" 
                    data-testid={`card-vehicle-${vehicle.id}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image Container */}
                    <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                      {vehicle.imageUrl ? (
                        <>
                          <img
                            src={vehicle.imageUrl}
                            alt={vehicle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            data-testid={`img-vehicle-${vehicle.id}`}
                          />
                          {/* Gradient Overlay on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Car className="h-16 w-16" />
                        </div>
                      )}
                      
                      {/* Floating Badge */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                        <Badge className="bg-white text-primary shadow-lg">
                          View Details
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Year Badge */}
                      <Badge variant="secondary" className="mb-3">
                        {vehicle.year}
                      </Badge>
                      
                      {/* Title */}
                      <h3 className="font-bold text-2xl mb-2 group-hover:text-primary transition-colors duration-300" data-testid={`text-vehicle-title-${vehicle.id}`}>
                        {vehicle.title}
                      </h3>
                      
                      {/* Subtitle */}
                      <p className="text-sm text-muted-foreground mb-6">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      
                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Price</p>
                          <p className="text-2xl md:text-3xl font-bold gradient-text" data-testid={`text-vehicle-price-${vehicle.id}`}>
                            {vehicle.price}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <ArrowRight className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            {vehicles.length > 6 && (
              <div className="text-center">
                <Link href={`/${slug}/inventory`}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-primary-purple shadow-lg shadow-primary/20 text-lg px-10 py-6 h-auto hover:shadow-xl hover:scale-105 transition-all duration-300" 
                    data-testid="button-view-all"
                  >
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
        <section className="py-20 md:py-28">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-8">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Inventory Coming Soon</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              We're currently updating our inventory. Check back soon or contact us for available vehicles.
            </p>
            <Button size="lg" className="px-8" data-testid="button-contact-no-vehicles">
              <Phone className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </section>
      )}

      {/* Our Services - Modern Cards */}
      {(() => {
        // Only show services section if user has configured services
        const hasConfiguredServices = dealership.servicesData?.services && dealership.servicesData.services.length > 0;
        
        // Hide section if: user disabled it OR no services configured
        if (dealership.showServicesSection === 'false' || !hasConfiguredServices) {
          return null;
        }
        
        const iconMap: Record<string, any> = { Car, DollarSign, TrendingUp, Wrench, Shield, Award, Users, Star };
        const services = dealership.servicesData!.services; // We already checked it exists above
        
        // Dynamic grid layout based on number of services
        const getGridCols = (count: number) => {
          if (count === 1) return 'lg:grid-cols-1 max-w-md mx-auto';
          if (count === 2) return 'lg:grid-cols-2 max-w-4xl mx-auto';
          if (count === 3) return 'lg:grid-cols-3';
          return 'lg:grid-cols-4'; // 4 or more
        };
        
        return (
          <section className="py-20 md:py-28 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <Badge variant="outline" className="mb-4 px-4 py-2 text-sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Full Service
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-services-title">
                  Our Services
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Everything you need for your automotive journey
                </p>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 ${getGridCols(services.length)} gap-6`}>
                {services.map((service, index) => {
                  const IconComponent = iconMap[service.icon] || Car;
                  const testId = `card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`;
                  
                  return (
                    <Card 
                      key={index}
                      className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 cursor-pointer" 
                      data-testid={testId}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-8 text-center">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-purple/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* About Section */}
      {dealership.about && dealership.showAboutSection !== 'false' && (
        <section className="py-20 md:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl p-8 md:p-12 lg:p-16 border border-border">
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-4 px-4 py-2">
                  <Sparkles className="mr-2 h-4 w-4" />
                  About Us
                </Badge>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="text-about-title">
                  About {dealership.name}
                </h2>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center" data-testid="text-about">
                {dealership.about}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA Section - Premium */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary-purple/5 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-cta-title">
              Ready to Find Your Next Car?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Our team is here to help you every step of the way. Visit us today!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Info Card */}
            <Card className="border-2">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-2xl font-bold mb-6">Visit Our Showroom</h3>
                
                {dealership.address && (
                  <div className="flex items-start gap-4 group">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-lg">Location</h4>
                      <p className="text-muted-foreground leading-relaxed" data-testid="text-address">
                        {dealership.address}
                      </p>
                    </div>
                  </div>
                )}

                {dealership.phone && (
                  <div className="flex items-start gap-4 group">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-lg">Phone</h4>
                      <a 
                        href={`tel:${dealership.phone}`}
                        className="text-muted-foreground hover:text-primary transition-colors text-lg"
                        data-testid="link-phone"
                      >
                        {dealership.phone}
                      </a>
                    </div>
                  </div>
                )}

                {dealership.hours && (
                  <div className="flex items-start gap-4 group">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-lg">Hours</h4>
                      <p className="text-muted-foreground whitespace-pre-line leading-relaxed" data-testid="text-hours">
                        {dealership.hours}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary-purple/5">
              <CardContent className="p-8 h-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">Get More Information</h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Contact us today to learn more about our inventory, financing options, or to schedule a test drive.
                </p>
                
                <div className="space-y-4">
                  <Link href={`/${slug}/inventory`}>
                    <Button 
                      size="lg" 
                      className="w-full text-lg py-6 h-auto bg-gradient-to-r from-primary to-primary-purple shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                      data-testid="button-view-inventory-cta"
                    >
                      View Inventory
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                  {dealership.phone && (
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full text-lg py-6 h-auto hover:bg-muted transition-all duration-300" 
                      asChild 
                      data-testid="button-call-now"
                    >
                      <a href={`tel:${dealership.phone}`}>
                        <Phone className="mr-2 h-5 w-5" />
                        Call Now
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer - Modern & Clean */}
      <footer className="border-t bg-muted/30">
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
