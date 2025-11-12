import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Sparkles, ExternalLink, Copy, Upload, Image as ImageIcon, Type } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
    tagline: string | null;
    heroImageUrl: string | null;
    trialStartsAt: string;
    trialEndsAt: string;
    subscriptionStatus: string;
  } | null;
};

const templates = [
  {
    id: "luxury",
    name: "Luxury Elite",
    description: "Premium design for high-end dealerships",
    features: ["Elegant typography", "High-contrast styling", "Premium feel"],
    preview: "Dark theme with gold accents and sophisticated layout",
  },
  {
    id: "classic",
    name: "Classic Pro",
    description: "Traditional and trustworthy design",
    features: ["Professional layout", "Easy navigation", "Timeless design"],
    preview: "Clean white design with blue accents",
  },
  {
    id: "modern",
    name: "Modern Edge",
    description: "Contemporary and sleek design",
    features: ["Bold visuals", "Modern UI", "Fresh approach"],
    preview: "Vibrant colors with modern gradients",
  },
];

export default function Website() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [tagline, setTagline] = useState<string>("");
  const [isSavingTagline, setIsSavingTagline] = useState(false);

  const { data, isLoading, error } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      setLocation("/login");
    }
  }, [error, setLocation]);

  useEffect(() => {
    if (data?.dealership) {
      setSelectedTemplate(data.dealership.templateStyle);
      if (data.dealership.heroImageUrl) {
        setHeroImagePreview(data.dealership.heroImageUrl);
      }
      if (data.dealership.tagline) {
        setTagline(data.dealership.tagline);
      }
    }
  }, [data]);

  const updateTemplateMutation = useMutation({
    mutationFn: async (templateStyle: string) => {
      const response = await apiRequest(
        "PATCH",
        `/api/dealerships/${data?.dealership?.id}`,
        { templateStyle }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Template updated!",
        description: "Your dealership website template has been changed.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Could not update your template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    updateTemplateMutation.mutate(templateId);
  };

  const handleSaveTagline = async () => {
    if (!data?.dealership?.id) return;

    setIsSavingTagline(true);
    try {
      await apiRequest(`/api/dealerships/${data.dealership.id}/tagline`, 'PATCH', {
        tagline,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Tagline saved!",
        description: "Your homepage tagline has been updated.",
      });
    } catch (error) {
      console.error('Tagline update error:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update tagline",
        variant: "destructive",
      });
    } finally {
      setIsSavingTagline(false);
    }
  };

  const copyToClipboard = () => {
    if (data?.dealership?.slug) {
      navigator.clipboard.writeText(`${data.dealership.slug}.dealerdelight.com`);
      toast({
        title: "Copied!",
        description: "Website URL copied to clipboard.",
      });
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPEG, PNG, GIF, or WebP)",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Hero image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingHero(true);

      // Get upload URL
      const uploadResponse = await apiRequest('/api/objects/upload', 'POST', {}) as any;
      const { uploadURL } = uploadResponse;

      // Upload file to object storage
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      // Save hero image with ACL
      const saveResponse = await apiRequest('/api/dealership/hero-image/upload', 'PATCH', {
        heroImageUrl: uploadURL,
      }) as any;

      setHeroImagePreview(saveResponse.objectPath);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });

      toast({
        title: "Hero image uploaded!",
        description: "Your homepage hero image has been updated.",
      });
    } catch (error) {
      console.error('Hero upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload hero image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) {
        heroFileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Website</h2>
        <p className="text-muted-foreground">
          Customize your dealership website template and branding
        </p>
      </div>

      {/* Website URL Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary-purple/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Your Live Website
          </CardTitle>
          <CardDescription>
            Your dealership website is live and ready to share
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-background/80 px-4 py-3 rounded-md text-lg font-semibold" data-testid="text-website-url">
              {data.dealership?.slug}.dealerdelight.com
            </code>
            <Button
              variant="outline"
              size="icon"
              data-testid="button-copy-url"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              data-testid="button-view-website"
              onClick={() => {
                window.open(`https://${data.dealership?.slug}.dealerdelight.com`, "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Website
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this URL with your customers to showcase your inventory and dealership.
          </p>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Choose Your Template
          </CardTitle>
          <CardDescription>
            Select the design that best represents your dealership brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover-elevate"
                }`}
                data-testid={`card-template-${template.id}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {selectedTemplate === template.id && (
                      <Badge variant="default" className="gap-1" data-testid={`badge-selected-${template.id}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-md bg-muted p-4 min-h-[100px] flex items-center justify-center text-sm text-muted-foreground text-center">
                    {template.preview}
                  </div>
                  <ul className="space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {updateTemplateMutation.isPending && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Updating template...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hero Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Homepage Hero Image
          </CardTitle>
          <CardDescription>
            Upload a stunning hero image for your dealership homepage (recommended: 1920x600px)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {heroImagePreview && (
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              <img
                src={heroImagePreview}
                alt="Hero preview"
                className="w-full h-48 object-cover"
                data-testid="img-hero-preview"
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                  Current Hero
                </Badge>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={heroFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpload}
              className="hidden"
              data-testid="input-hero-upload"
            />
            <Button
              onClick={() => heroFileInputRef.current?.click()}
              disabled={isUploadingHero}
              data-testid="button-upload-hero"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploadingHero ? "Uploading..." : heroImagePreview ? "Change Hero Image" : "Upload Hero Image"}
            </Button>
            {heroImagePreview && (
              <Button
                variant="outline"
                onClick={() => {
                  if (data?.dealership?.slug) {
                    window.open(`/${data.dealership.slug}`, "_blank");
                  }
                }}
                data-testid="button-preview-hero"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview on Website
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Upload a high-quality image to make a great first impression. Supported formats: JPEG, PNG, GIF, WebP (max 10MB)
          </p>
        </CardContent>
      </Card>

      {/* Homepage Tagline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Homepage Tagline
          </CardTitle>
          <CardDescription>
            Add a custom subheadline that appears on your homepage hero section (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              data-testid="input-tagline"
              placeholder="Your trusted auto dealer - transparent pricing and quality service"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground">
              Keep it short and compelling (max 150 characters)
            </p>
          </div>

          <Button
            onClick={handleSaveTagline}
            disabled={isSavingTagline}
            data-testid="button-save-tagline"
          >
            {isSavingTagline ? "Saving..." : "Save Tagline"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
