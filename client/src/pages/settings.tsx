import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Image, Save, Mail, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertBusinessDetailsSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type UserData = {
  user: {
    id: string;
    email: string;
    dealershipId: string;
  };
  dealership: {
    id: string;
    name: string;
    slug: string;
    templateStyle: string;
    address: string | null;
    phone: string | null;
    hours: string | null;
    about: string | null;
    logoUrl: string | null;
    trialStartsAt: string;
    trialEndsAt: string;
    subscriptionStatus: string;
  } | null;
};

type BusinessDetailsFormData = z.infer<typeof insertBusinessDetailsSchema>;

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("business");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      setLocation("/login");
    }
  }, [error, setLocation]);

  const businessForm = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(insertBusinessDetailsSchema),
    defaultValues: {
      address: data?.dealership?.address || "",
      phone: data?.dealership?.phone || "",
      hours: data?.dealership?.hours || "",
      about: data?.dealership?.about || "",
    },
  });

  useEffect(() => {
    if (data?.dealership) {
      businessForm.reset({
        address: data.dealership.address || "",
        phone: data.dealership.phone || "",
        hours: data.dealership.hours || "",
        about: data.dealership.about || "",
      });
    }
  }, [data, businessForm]);

  const businessMutation = useMutation({
    mutationFn: async (values: BusinessDetailsFormData) => {
      if (!data?.dealership?.id) throw new Error("No dealership found");
      return await apiRequest("PATCH", `/api/dealerships/${data.dealership.id}/business-details`, values);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Business details updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update business details",
        variant: "destructive",
      });
    },
  });

  const onBusinessSubmit = async (values: BusinessDetailsFormData) => {
    await businessMutation.mutateAsync(values);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);

    try {
      // Get presigned URL
      const uploadResponse = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await uploadResponse.json();

      // Upload file to storage
      const uploadToStorageResponse = await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadToStorageResponse.ok) {
        throw new Error(`Upload failed with status ${uploadToStorageResponse.status}`);
      }

      // Save logo URL to database
      await apiRequest("PATCH", "/api/dealership/logo/upload", { logoUrl: uploadURL });
      
      // Refresh data
      await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      // Reset input
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and dealership information
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="business" data-testid="tab-business">
            <Building2 className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="logo" data-testid="tab-logo">
            <Image className="h-4 w-4 mr-2" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="account" data-testid="tab-account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Update your dealership's contact information and business hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                  <FormField
                    control={businessForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street, City, State ZIP"
                            {...field}
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={businessForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+1 (555) 123-4567"
                            {...field}
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={businessForm.control}
                    name="hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Hours</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mon-Fri: 9am-6pm&#10;Sat: 10am-5pm&#10;Sun: Closed"
                            {...field}
                            rows={4}
                            data-testid="input-hours"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={businessForm.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Your Dealership</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell customers about your dealership, your history, what makes you special..."
                            {...field}
                            rows={6}
                            data-testid="input-about"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={businessMutation.isPending}
                      data-testid="button-save-business"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {businessMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dealership Logo</CardTitle>
              <CardDescription>
                Upload your dealership logo. For best results, use a square or horizontal logo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                {/* Current Logo Thumbnail */}
                {data.dealership?.logoUrl && (
                  <div className="w-20 h-20 rounded-lg border-2 bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={data.dealership.logoUrl} 
                      alt="Current logo" 
                      className="max-w-full max-h-full object-contain"
                      data-testid="img-current-logo"
                    />
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex-1">
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    data-testid="input-logo-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    data-testid="button-change-logo"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingLogo ? "Uploading..." : (data.dealership?.logoUrl ? "Change Logo" : "Upload Logo")}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="text-lg font-medium" data-testid="text-user-email">{data.user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Dealership Name</label>
                <p className="text-lg font-medium" data-testid="text-dealership-name">{data.dealership?.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Website URL</label>
                <code className="block bg-muted px-3 py-2 rounded-md text-sm" data-testid="text-website-url">
                  {data.dealership?.slug}.dealerdelight.com
                </code>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Website Template</label>
                <Badge variant="outline" data-testid="badge-template-style">
                  {data.dealership?.templateStyle === 'luxury' && 'Luxury Elite'}
                  {data.dealership?.templateStyle === 'classic' && 'Classic Pro'}
                  {data.dealership?.templateStyle === 'modern' && 'Modern Edge'}
                  {!data.dealership?.templateStyle && 'Not Selected'}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Subscription Status</label>
                <Badge 
                  variant={data.dealership?.subscriptionStatus === 'trial' ? 'secondary' : 'default'}
                  data-testid="badge-subscription-status"
                >
                  {data.dealership?.subscriptionStatus === 'trial' ? 'Trial' : data.dealership?.subscriptionStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
