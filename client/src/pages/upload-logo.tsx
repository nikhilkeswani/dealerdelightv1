import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";

export default function UploadLogo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{
    user: { id: string; email: string; dealershipId: string };
    dealership: { id: string; name: string; logoUrl: string | null } | null;
  }>({
    queryKey: ["/api/auth/me"],
  });

  const dealership = data?.dealership;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Upload Your Logo</h1>
          <p className="text-muted-foreground">
            Add your dealership logo to make your website stand out
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logo Image</CardTitle>
            <CardDescription>
              Upload your logo image. For best results, use a square or horizontal logo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Logo */}
            {dealership?.logoUrl && (
              <div>
                <label className="text-sm font-medium mb-2 block">Current Logo</label>
                <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                  <img 
                    src={dealership.logoUrl} 
                    alt="Current logo" 
                    className="max-h-32 object-contain"
                    data-testid="img-current-logo"
                  />
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <FileUploader
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                onGetUploadUrl={async () => {
                  const response = await apiRequest("POST", "/api/objects/upload");
                  const data = await response.json();
                  return data.uploadURL;
                }}
                onUploadComplete={async (uploadUrl) => {
                  try {
                    await apiRequest("PATCH", "/api/dealership/logo/upload", { logoUrl: uploadUrl });
                    // Force immediate refetch instead of just invalidating
                    await queryClient.refetchQueries({ queryKey: ["/api/auth/me"] });
                    toast({
                      title: "Logo updated",
                      description: "Your dealership logo has been saved.",
                    });
                    setLocation("/dashboard");
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to save logo",
                      variant: "destructive",
                    });
                    throw error;
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
