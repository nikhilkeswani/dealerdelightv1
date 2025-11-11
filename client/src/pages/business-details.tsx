import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBusinessDetailsSchema } from "@shared/schema";
import type { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, ArrowLeft } from "lucide-react";

type BusinessDetailsFormData = z.infer<typeof insertBusinessDetailsSchema>;

export default function BusinessDetails() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useQuery<{
    user: { id: string; email: string; dealershipId: string };
    dealership: { id: string; name: string; address: string | null; phone: string | null; hours: string | null; about: string | null } | null;
  }>({
    queryKey: ["/api/auth/me"],
  });

  const dealership = data?.dealership;

  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(insertBusinessDetailsSchema),
    defaultValues: {
      address: dealership?.address || "",
      phone: dealership?.phone || "",
      hours: dealership?.hours || "",
      about: dealership?.about || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: BusinessDetailsFormData) => {
      if (!dealership?.id) throw new Error("No dealership found");
      
      const response = await apiRequest("PATCH", `/api/dealerships/${dealership.id}/business-details`, values);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Business details saved",
        description: "Your dealership information has been updated.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save business details",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: BusinessDetailsFormData) => {
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
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Business Details</h1>
          <p className="text-muted-foreground">
            Tell us about your dealership so customers can find and contact you
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dealership Information</CardTitle>
            <CardDescription>
              This information will appear on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
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
                    {isSubmitting ? "Saving..." : "Save & Continue"}
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
