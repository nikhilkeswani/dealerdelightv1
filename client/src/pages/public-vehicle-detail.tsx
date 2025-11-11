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
import { ArrowLeft, Mail, Phone, MapPin, Gauge, Fuel, Settings, Palette, Calendar, Hash } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-4xl font-bold mb-4">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This vehicle is no longer available.
          </p>
          {slug && (
            <Link href={`/${slug}/inventory`}>
              <Button data-testid="button-back-inventory">
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
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href={`/${slug}/inventory`}>
              <Button variant="ghost" size="sm" data-testid="button-back-inventory">
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
                    className="h-10 w-auto object-contain"
                    data-testid="img-dealership-logo"
                  />
                ) : (
                  <h1 className="text-lg font-bold" data-testid="text-dealership-name">
                    {dealership.name}
                  </h1>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="aspect-video bg-muted overflow-hidden rounded-xl border">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                  data-testid="img-vehicle-main"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <p>No Image Available</p>
                </div>
              )}
            </div>

            {/* Vehicle Title and Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-3">
                    {vehicle.year}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-vehicle-title">
                    {vehicle.title}
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    {vehicle.make} {vehicle.model} {vehicle.trim}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary" data-testid="text-vehicle-price">
                    {vehicle.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Specs Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Key Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <Gauge className="h-8 w-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Mileage</p>
                    <p className="font-semibold" data-testid="text-spec-mileage">{vehicle.mileage}</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <Settings className="h-8 w-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Transmission</p>
                    <p className="font-semibold" data-testid="text-spec-transmission">{vehicle.transmission}</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <Fuel className="h-8 w-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Fuel Type</p>
                    <p className="font-semibold" data-testid="text-spec-fuel">{vehicle.fuelType}</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Year</p>
                    <p className="font-semibold" data-testid="text-spec-year">{vehicle.year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {vehicle.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed" data-testid="text-vehicle-description">
                    {vehicle.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Complete Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Year</p>
                        <p className="font-medium" data-testid="text-spec-year">{vehicle.year}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Make</p>
                        <p className="font-medium" data-testid="text-spec-make">{vehicle.make}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Model</p>
                        <p className="font-medium" data-testid="text-spec-model">{vehicle.model}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Badge className="mt-1" variant="outline">{vehicle.trim}</Badge>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Trim</p>
                        <p className="font-medium" data-testid="text-spec-trim">{vehicle.trim}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Body Type</p>
                        <p className="font-medium" data-testid="text-spec-body">{vehicle.bodyType}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Exterior Color</p>
                        <p className="font-medium" data-testid="text-spec-exterior">{vehicle.exteriorColor}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Interior Color</p>
                        <p className="font-medium" data-testid="text-spec-interior">{vehicle.interiorColor}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Gauge className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Mileage</p>
                        <p className="font-medium">{vehicle.mileage}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Transmission</p>
                        <p className="font-medium">{vehicle.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Fuel className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Fuel Type</p>
                        <p className="font-medium">{vehicle.fuelType}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">VIN Number</p>
                      <p className="font-mono text-sm font-medium" data-testid="text-spec-vin">{vehicle.vin}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Interested in this vehicle?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Contact us to schedule a test drive or get more information about this vehicle.
                  </p>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setShowContactForm(true)}
                    data-testid="button-inquire"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Send Inquiry
                  </Button>

                  {dealership?.phone && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
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

              {dealership && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dealership Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold mb-1">{dealership.name}</p>
                    </div>
                    {dealership.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground" data-testid="text-dealer-address">
                          {dealership.address}
                        </p>
                      </div>
                    )}
                    {dealership.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <a 
                          href={`tel:${dealership.phone}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {dealership && (
              <>
                <p className="text-muted-foreground mb-2">
                  © {new Date().getFullYear()} {dealership.name}. All rights reserved.
                </p>
                <p className="text-sm text-muted-foreground">
                  Powered by <span className="text-primary font-medium">DealerDelight</span>
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
            <DialogTitle>Inquire About This Vehicle</DialogTitle>
            <DialogDescription>
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
