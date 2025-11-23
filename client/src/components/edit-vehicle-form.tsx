import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema } from "@shared/schema";
import type { z } from "zod";
import type { Vehicle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

type VehicleFormData = z.infer<typeof insertVehicleSchema>;

interface EditVehicleFormProps {
  vehicle: Vehicle;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditVehicleForm({ vehicle, onSuccess, onCancel }: EditVehicleFormProps) {
  const { toast } = useToast();
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize preview URL - only use vehicle.imageUrl if it's a valid URL format
  const isValidImageUrl = vehicle.imageUrl && 
    (vehicle.imageUrl.startsWith('/objects/') || 
     vehicle.imageUrl.startsWith('http://') || 
     vehicle.imageUrl.startsWith('https://'));
  const [previewUrl, setPreviewUrl] = useState<string>(isValidImageUrl ? vehicle.imageUrl : "");

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      title: vehicle.title,
      price: vehicle.price,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      imageUrl: vehicle.imageUrl || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: VehicleFormData) => {
      const response = await apiRequest("PATCH", `/api/vehicles/${vehicle.id}`, values);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealerships"] });
      toast({
        title: "Vehicle updated",
        description: "Your vehicle has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

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
      const uploadResponse = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await uploadResponse.json();

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
      const gcsPath = `gs://${bucketName}/${objectPath}`;

      // Create a public URL for preview (remove query params)
      const previewUrlValue = `${url.protocol}//${url.host}${url.pathname}`;

      // Store preview URL and GCS path in form
      setPreviewUrl(previewUrlValue);
      form.setValue("imageUrl", gcsPath);

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
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = async (values: VehicleFormData) => {
    await mutation.mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  data-testid="input-edit-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
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
                    data-testid="input-edit-year"
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
                    data-testid="input-edit-make"
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
                    data-testid="input-edit-model"
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
                  data-testid="input-edit-price"
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
                        data-testid="img-edit-vehicle-preview"
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
                      data-testid="input-edit-vehicle-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={uploadingImage}
                      data-testid="button-edit-upload-image"
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

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
            data-testid="button-edit-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="button-edit-save"
          >
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
