import { useState } from "react";
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sparkles,
  BarChart3,
  Briefcase,
  Eye,
  Save,
  Plus,
  Trash2,
  Car,
  DollarSign,
  TrendingUp,
  Wrench,
  Info
} from "lucide-react";

type UserData = {
  user: { id: string; email: string; dealershipId: string };
  dealership: {
    id: string;
    name: string;
    slug: string;
    
    // Content
    about: string | null;
    
    // Stats
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
    
    // Section Visibility
    showStatsSection: string | null;
    showServicesSection: string | null;
    showAboutSection: string | null;
  } | null;
};

const defaultServices = [
  { title: "Vehicle Sales", description: "Browse our extensive inventory of new and pre-owned vehicles", icon: "Car" },
  { title: "Financing", description: "Competitive rates and flexible financing options available", icon: "DollarSign" },
  { title: "Trade-Ins", description: "Get the best value for your current vehicle", icon: "TrendingUp" },
  { title: "Service & Maintenance", description: "Professional maintenance and repair services", icon: "Wrench" }
];

const iconOptions = ["Car", "DollarSign", "TrendingUp", "Wrench", "Shield", "Award", "Users", "Star"];

export default function CustomizeHomepage() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
  });

  const dealership = data?.dealership;

  // Stats State
  const [statsYears, setStatsYears] = useState<string>("");
  const [statsClients, setStatsClients] = useState<string>("");
  const [statsRating, setStatsRating] = useState<string>("");
  const [showVehicleCount, setShowVehicleCount] = useState(true);
  
  // Services State
  const [services, setServices] = useState(defaultServices);
  
  // Visibility State
  const [showStatsSection, setShowStatsSection] = useState(true);
  const [showServicesSection, setShowServicesSection] = useState(true);
  const [showAboutSection, setShowAboutSection] = useState(true);
  
  // About Text State
  const [aboutText, setAboutText] = useState("");

  // Initialize state when data loads - using useEffect instead of useState
  React.useEffect(() => {
    if (dealership) {
      setStatsYears(dealership.statsYearsInBusiness?.toString() || "");
      setStatsClients(dealership.statsTotalClients?.toString() || "");
      setStatsRating(dealership.statsRating || "");
      setShowVehicleCount(dealership.statsShowVehicleCount !== 'false');
      
      if (dealership.servicesData?.services) {
        setServices(dealership.servicesData.services);
      }
      
      setShowStatsSection(dealership.showStatsSection !== 'false');
      setShowServicesSection(dealership.showServicesSection !== 'false');
      setShowAboutSection(dealership.showAboutSection !== 'false');
      setAboutText(dealership.about || "");
    }
  }, [dealership]);

  const saveMutation = useMutation({
    mutationFn: async (section: 'stats' | 'services' | 'visibility' | 'about') => {
      const updateData: any = {};
      
      if (section === 'stats') {
        // Validate and sanitize stats - trim whitespace and convert to numbers
        const yearsTrimmed = statsYears?.trim();
        const clientsTrimmed = statsClients?.trim();
        const ratingTrimmed = statsRating?.trim();
        
        // Only save if valid number, otherwise null
        updateData.statsYearsInBusiness = yearsTrimmed && !isNaN(Number(yearsTrimmed)) ? parseInt(yearsTrimmed) : null;
        updateData.statsTotalClients = clientsTrimmed && !isNaN(Number(clientsTrimmed)) ? parseInt(clientsTrimmed) : null;
        
        // Validate rating format (should be like "4.5" or "5.0")
        if (ratingTrimmed && !isNaN(Number(ratingTrimmed))) {
          const ratingNum = parseFloat(ratingTrimmed);
          if (ratingNum >= 0 && ratingNum <= 5) {
            updateData.statsRating = ratingNum.toFixed(1);
          } else {
            throw new Error("Rating must be between 0 and 5");
          }
        } else {
          updateData.statsRating = null;
        }
        
        updateData.statsShowVehicleCount = showVehicleCount ? 'true' : 'false';
      } else if (section === 'services') {
        // Validate services - filter out empty ones
        const validServices = services.filter(service => {
          const titleValid = service.title?.trim().length > 0;
          const descValid = service.description?.trim().length >= 10;
          return titleValid && descValid;
        }).map(service => ({
          icon: service.icon,
          title: service.title.trim(),
          description: service.description.trim()
        }));
        
        if (validServices.length === 0) {
          throw new Error("Please add at least one service with a title and description (min 10 characters)");
        }
        
        updateData.servicesData = { services: validServices };
        updateData.servicesEnabled = 'true';
      } else if (section === 'visibility') {
        updateData.showStatsSection = showStatsSection ? 'true' : 'false';
        updateData.showServicesSection = showServicesSection ? 'true' : 'false';
        updateData.showAboutSection = showAboutSection ? 'true' : 'false';
      } else if (section === 'about') {
        // Validate about text - must have real content
        const trimmedAbout = aboutText?.trim();
        if (!trimmedAbout || trimmedAbout.length < 20) {
          throw new Error("About text must be at least 20 characters (excluding spaces)");
        }
        updateData.about = trimmedAbout;
      }
      
      await apiRequest("PATCH", `/api/dealerships/${dealership?.id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Saved successfully",
        description: "Your homepage customization has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save changes",
        variant: "destructive",
      });
    },
  });

  const addService = () => {
    setServices([...services, { title: "", description: "", icon: "Car" }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!dealership) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No dealership found. Please complete your profile first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customize Homepage</h1>
          <p className="text-muted-foreground">
            Personalize your dealership's homepage content and sections
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={`/${dealership.slug}`} target="_blank" rel="noopener noreferrer">
            <Eye className="mr-2 h-4 w-4" />
            Preview Site
          </a>
        </Button>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">
            <BarChart3 className="mr-2 h-4 w-4" />
            Stats Bar
          </TabsTrigger>
          <TabsTrigger value="services">
            <Briefcase className="mr-2 h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="about">
            <Sparkles className="mr-2 h-4 w-4" />
            About
          </TabsTrigger>
          <TabsTrigger value="visibility">
            <Eye className="mr-2 h-4 w-4" />
            Visibility
          </TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats Bar Configuration</CardTitle>
              <CardDescription>
                Customize the statistics shown on your homepage. Leave fields empty to hide that stat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="years">Years in Business</Label>
                  <Input
                    id="years"
                    type="number"
                    placeholder="e.g., 15"
                    value={statsYears}
                    onChange={(e) => setStatsYears(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Will display as "{statsYears || 'XX'}+ Years"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clients">Total Clients Served</Label>
                  <Input
                    id="clients"
                    type="number"
                    placeholder="e.g., 5000"
                    value={statsClients}
                    onChange={(e) => setStatsClients(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Will display as "{statsClients || 'XXXX'}+ Happy Clients"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Customer Rating</Label>
                  <Input
                    id="rating"
                    type="text"
                    placeholder="e.g., 5.0"
                    value={statsRating}
                    onChange={(e) => setStatsRating(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Typically 4.5 - 5.0 stars
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vehicle-count">Show Vehicle Count</Label>
                    <Switch
                      id="vehicle-count"
                      checked={showVehicleCount}
                      onCheckedChange={setShowVehicleCount}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically displays your current inventory count
                  </p>
                </div>
              </div>

              <Button
                onClick={() => saveMutation.mutate('stats')}
                disabled={saveMutation.isPending}
                className="w-full md:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Stats Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Services Section</CardTitle>
                  <CardDescription>
                    Customize the services you offer. Recommended: 4 services.
                  </CardDescription>
                </div>
                <Button onClick={addService} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {services.map((service, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <Badge variant="outline">Service {index + 1}</Badge>
                      {services.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <select
                          value={service.icon}
                          onChange={(e) => updateService(index, 'icon', e.target.value)}
                          className="w-full p-2 border rounded-md bg-background"
                        >
                          {iconOptions.map((icon) => (
                            <option key={icon} value={icon}>
                              {icon}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="e.g., Vehicle Sales"
                          value={service.title}
                          onChange={(e) => updateService(index, 'title', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Brief description of this service (minimum 10 characters)..."
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        {service.description.trim().length < 10 ? (
                          <span className="text-destructive">Min 10 characters. Current: {service.description.trim().length}</span>
                        ) : (
                          <span className="text-green-600">{service.description.trim().length} characters ✓</span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                onClick={() => saveMutation.mutate('services')}
                disabled={saveMutation.isPending}
                className="w-full md:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Services
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Dealership Story
              </CardTitle>
              <CardDescription>
                Tell customers about your dealership's history, values, and what makes you unique.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about-text">About Text</Label>
                <Textarea
                  id="about-text"
                  placeholder="Since 2006, we've been serving the Dublin community with quality vehicles and exceptional service. Our family-owned dealership prides itself on transparency, customer satisfaction, and building long-term relationships with our clients."
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  rows={8}
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground">
                  {aboutText.trim().length < 20 ? (
                    <span className="text-destructive">Minimum 20 characters required. Current: {aboutText.trim().length}</span>
                  ) : (
                    <span className="text-green-600">Current: {aboutText.trim().length} characters ✓</span>
                  )}
                </p>
              </div>

              <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Writing Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Share your dealership's founding story and years of experience</li>
                  <li>Highlight what makes you different from competitors</li>
                  <li>Mention your commitment to customer service</li>
                  <li>Include community involvement or awards if applicable</li>
                  <li>Keep it authentic and personal</li>
                </ul>
              </div>

              <Button
                onClick={() => saveMutation.mutate('about')}
                disabled={saveMutation.isPending || aboutText.trim().length < 20}
                className="w-full md:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Save About Section"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Visibility</CardTitle>
              <CardDescription>
                Control which sections appear on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Stats Bar</p>
                    <p className="text-sm text-muted-foreground">
                      Display dealership statistics (vehicles, clients, rating, years)
                    </p>
                  </div>
                  <Switch
                    checked={showStatsSection}
                    onCheckedChange={setShowStatsSection}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Services Section</p>
                    <p className="text-sm text-muted-foreground">
                      Showcase the services your dealership offers
                    </p>
                  </div>
                  <Switch
                    checked={showServicesSection}
                    onCheckedChange={setShowServicesSection}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">About Section</p>
                    <p className="text-sm text-muted-foreground">
                      Display your dealership's about text (configure in About tab)
                    </p>
                    {(!aboutText || aboutText.length < 20) && (
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        ⚠️ Add about text in the About tab first
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={showAboutSection}
                    onCheckedChange={setShowAboutSection}
                  />
                </div>
              </div>

              <Button
                onClick={() => saveMutation.mutate('visibility')}
                disabled={saveMutation.isPending}
                className="w-full md:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Section Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

