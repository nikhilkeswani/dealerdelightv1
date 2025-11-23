import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema } from "@shared/schema";
import type { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, ArrowLeft, Upload } from "lucide-react";

type VehicleFormData = z.infer<typeof insertVehicleSchema>;

export default function AddVehicle() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // For preview display
  const [gcsPath, setGcsPath] = useState<string>(""); // For form submission

  const { data, isLoading } = useQuery<{
    user: { id: string; email: string; dealershipId: string };
    dealership: { id: string; name: string } | null;
  }>({
    queryKey: ["/api/auth/me"],
  });

  const dealership = data?.dealership;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      title: "",
      price: "",
      year: new Date().getFullYear().toString(),
      make: "",
      model: "",
      imageUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: VehicleFormData) => {
      if (!dealership?.id) throw new Error("No dealership found");
      
      const response = await apiRequest("POST", `/api/dealerships/${dealership.id}/vehicles`, values);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Vehicle added",
        description: "Your vehicle has been added to your inventory.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);

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

      // Convert signed URL to GCS path for backend
      // URL format: https://storage.googleapis.com/bucket-name/path/to/file?X-Goog-Algorithm=...
      const url = new URL(uploadURL);
      const pathParts = url.pathname.split('/').filter(p => p); // Remove empty strings
      const bucketName = pathParts[0]; // First part is bucket name
      const objectPath = pathParts.slice(1).join('/'); // Rest is object path
      const gcsPathValue = `gs://${bucketName}/${objectPath}`;

      // Create a public URL for preview (remove query params)
      const previewUrlValue = `${url.protocol}//${url.host}${url.pathname}`;

      // Store both values
      setGcsPath(gcsPathValue);
      setPreviewUrl(previewUrlValue);
      
      // Set the GCS path in the form (for submission to backend)
      form.setValue("imageUrl", gcsPathValue);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      // Reset input
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (values: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Add Your First Vehicle</h1>
          <p className="text-muted-foreground">
            Start building your inventory with your first vehicle listing
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>
              Add information about your vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2020 Honda Civic LX"
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2020"
                            {...field}
                            data-testid="input-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Honda"
                            {...field}
                            data-testid="input-make"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Civic"
                            {...field}
                            data-testid="input-model"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="€15,999"
                          {...field}
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Image (optional)</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {previewUrl && (
                            <div className="relative w-full h-48 rounded-lg border-2 bg-muted flex items-center justify-center overflow-hidden">
                              <img 
                                src={previewUrl} 
                                alt="Vehicle preview" 
                                className="max-w-full max-h-full object-contain"
                                data-testid="img-vehicle-preview"
                              />
                            </div>
                          )}
                          <div>
                            <input
                              ref={imageFileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              data-testid="input-vehicle-image"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => imageFileInputRef.current?.click()}
                              disabled={uploadingImage}
                              data-testid="button-upload-image"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingImage ? "Uploading..." : (previewUrl ? "Change Image" : "Upload Image")}
                            </Button>
                            <p className="text-sm text-muted-foreground mt-2">
                              JPG, PNG or GIF. Max size 5MB.
                            </p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard")}
                    disabled={isSubmitting}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    data-testid="button-save"
                  >
                    {isSubmitting ? "Saving..." : "Add Vehicle"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
