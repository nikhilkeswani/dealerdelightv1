import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Gauge, 
  Fuel, 
  Settings, 
  Palette, 
  Calendar, 
  Hash,
  Car,
  CheckCircle2,
  Sparkles,
  Shield,
  Award,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { InquiryForm } from "@/components/inquiry-form";

type Dealership = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
};

type Vehicle = {
  id: string;
  title: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  price: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  exteriorColor: string;
  interiorColor: string;
  vin: string;
  description: string;
  imageUrl: string | null;
};

export default function PublicVehicleDetail() {
  const [match, params] = useRoute("/:slug/vehicles/:id");
  const slug = params?.slug || "";
  const vehicleId = params?.id || "";
  const [showContactForm, setShowContactForm] = useState(false);

  const { data: dealership } = useQuery<Dealership>({
    queryKey: [`/api/public/dealerships/${slug}`],
    enabled: !!slug,
  });

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: [`/api/public/vehicles/${vehicleId}`],
    enabled: !!vehicleId,
  });

  if (vehicleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-primary/20 animate-pulse"></div>
          </div>
          <p className="text-muted-foreground text-lg font-medium animate-pulse">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <Car className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This vehicle is no longer available.
          </p>
          {slug && (
            <Link href={`/${slug}/inventory`}>
              <Button size="lg" data-testid="button-back-inventory">
                View All Vehicles
              </Button>
            </Link>
          )}
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
              <Link href={`/${slug}/inventory`}>
                <Button variant="ghost" size="sm" className="hover:bg-primary/5" data-testid="button-back-inventory">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Inventory
                </Button>
              </Link>
              {dealership && (
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
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image - Hero Style */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-border shadow-2xl group">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50">
                  {vehicle.imageUrl ? (
                    <>
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        data-testid="img-vehicle-main"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Car className="h-20 w-20 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No Image Available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Badges */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge className="bg-white/90 backdrop-blur-sm text-primary shadow-lg text-base px-4 py-2">
                    {vehicle.year}
                  </Badge>
                  <Badge className="bg-primary/90 backdrop-blur-sm text-white shadow-lg">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Featured
                  </Badge>
                </div>
              </div>

              {/* Vehicle Title and Price */}
              <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-3xl p-8 border border-border">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 gradient-text" data-testid="text-vehicle-title">
                      {vehicle.title}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground">
                      {vehicle.make} {vehicle.model} {vehicle.trim}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-medium">Starting at</p>
                    <p className="text-4xl md:text-5xl font-bold gradient-text" data-testid="text-vehicle-price">
                      {vehicle.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Specs Grid - Premium Design */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Key Specifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Gauge, label: "Mileage", value: vehicle.mileage, testId: "text-spec-mileage" },
                      { icon: Settings, label: "Transmission", value: vehicle.transmission, testId: "text-spec-transmission" },
                      { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType, testId: "text-spec-fuel" },
                      { icon: Calendar, label: "Year", value: vehicle.year, testId: "text-spec-year" }
                    ].map((spec) => (
                      <div key={spec.label} className="group/spec p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 hover:from-primary/5 hover:to-primary-purple/5 transition-all duration-300 hover:scale-105 border border-transparent hover:border-primary/20">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover/spec:bg-primary group-hover/spec:text-white transition-all duration-300 group-hover/spec:scale-110">
                            <spec.icon className="h-7 w-7" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">{spec.label}</p>
                          <p className="font-bold text-base" data-testid={spec.testId}>{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {vehicle.description && (
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Car className="h-6 w-6 text-primary" />
                      <CardTitle className="text-2xl">Vehicle Description</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-lg" data-testid="text-vehicle-description">
                      {vehicle.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Complete Specifications - Organized */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Complete Specifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1 */}
                    <div className="space-y-5">
                      {[
                        { icon: Calendar, label: "Year", value: vehicle.year, testId: "text-spec-year" },
                        { icon: Settings, label: "Make", value: vehicle.make, testId: "text-spec-make" },
                        { icon: Settings, label: "Model", value: vehicle.model, testId: "text-spec-model" },
                        { icon: Badge, label: "Trim", value: vehicle.trim, testId: "text-spec-trim" },
                        { icon: Car, label: "Body Type", value: vehicle.bodyType, testId: "text-spec-body" }
                      ].map((spec) => (
                        <div key={spec.label} className="flex items-start gap-4 pb-5 border-b border-border last:border-0 group/item hover:pl-2 transition-all duration-300">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/10 transition-colors duration-300">
                            <spec.icon className="h-6 w-6 text-muted-foreground group-hover/item:text-primary transition-colors duration-300" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wide font-medium">{spec.label}</p>
                            <p className="font-semibold text-lg" data-testid={spec.testId}>{spec.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Column 2 */}
                    <div className="space-y-5">
                      {[
                        { icon: Palette, label: "Exterior Color", value: vehicle.exteriorColor, testId: "text-spec-exterior" },
                        { icon: Palette, label: "Interior Color", value: vehicle.interiorColor, testId: "text-spec-interior" },
                        { icon: Gauge, label: "Mileage", value: vehicle.mileage },
                        { icon: Settings, label: "Transmission", value: vehicle.transmission },
                        { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType }
                      ].map((spec) => (
                        <div key={spec.label} className="flex items-start gap-4 pb-5 border-b border-border last:border-0 group/item hover:pl-2 transition-all duration-300">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/10 transition-colors duration-300">
                            <spec.icon className="h-6 w-6 text-muted-foreground group-hover/item:text-primary transition-colors duration-300" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wide font-medium">{spec.label}</p>
                            <p className="font-semibold text-lg" data-testid={spec.testId}>{spec.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VIN - Full Width */}
                  <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                      <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                        <Hash className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-medium">VIN Number</p>
                        <p className="font-mono text-base md:text-lg font-semibold" data-testid="text-spec-vin">{vehicle.vin}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sticky Contact CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Main CTA Card */}
                <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-card to-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <Badge variant="outline" className="text-xs">Available Now</Badge>
                    </div>
                    <CardTitle className="text-2xl">Interested in This Vehicle?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      Contact us to schedule a test drive or get more information about this vehicle.
                    </p>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary-purple text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-14 text-lg"
                      onClick={() => setShowContactForm(true)}
                      data-testid="button-inquire"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Send Inquiry
                    </Button>

                    {dealership?.phone && (
                      <Button 
                        variant="outline" 
                        className="w-full h-14 text-lg hover:bg-muted transition-all duration-300"
                        asChild
                        data-testid="button-call"
                      >
                        <a href={`tel:${dealership.phone}`}>
                          <Phone className="mr-2 h-5 w-5" />
                          Call Us Now
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Why Buy From Us */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Why Buy From Us?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { icon: Shield, text: "Certified Quality Guarantee" },
                      { icon: CheckCircle2, text: "Comprehensive Inspection" },
                      { icon: Award, text: "Competitive Pricing" },
                      { icon: Phone, text: "Dedicated Support Team" }
                    ].map((item) => (
                      <div key={item.text} className="flex items-start gap-3 group/benefit">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/benefit:bg-primary group-hover/benefit:text-white transition-all duration-300">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium pt-2">{item.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Dealership Info */}
                {dealership && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Dealership Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="font-bold text-lg mb-1">{dealership.name}</p>
                      </div>
                      {dealership.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-dealer-address">
                            {dealership.address}
                          </p>
                        </div>
                      )}
                      {dealership.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                          <a 
                            href={`tel:${dealership.phone}`}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                            data-testid="text-dealer-phone"
                          >
                            {dealership.phone}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            {dealership && (
              <>
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
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Contact Form Dialog */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-inquiry-form">
          <DialogHeader>
            <DialogTitle className="text-2xl">Inquire About This Vehicle</DialogTitle>
            <DialogDescription className="text-base">
              Fill out the form below and we'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <InquiryForm
            dealershipSlug={slug}
            vehicleId={vehicle.id}
            vehicleTitle={vehicle.title}
            onSuccess={() => setShowContactForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
