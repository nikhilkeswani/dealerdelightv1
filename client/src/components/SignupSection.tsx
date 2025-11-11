import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const COUNTRY_CODES = [
  { value: "+1", label: "+1 (US/Canada)" },
  { value: "+44", label: "+44 (UK)" },
  { value: "+61", label: "+61 (Australia)" },
  { value: "+91", label: "+91 (India)" },
  { value: "+86", label: "+86 (China)" },
  { value: "+49", label: "+49 (Germany)" },
  { value: "+33", label: "+33 (France)" },
  { value: "+81", label: "+81 (Japan)" },
  { value: "+971", label: "+971 (UAE)" },
];

const formSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  dealershipName: z.string().min(2, "Please enter your dealership name"),
  dealerWebsite: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  message: z.string().min(10, "Please tell us about your requirements"),
});

type FormData = z.infer<typeof formSchema>;

export default function SignupSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "+1",
      phone: "",
      dealershipName: "",
      dealerWebsite: "",
      message: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Transform field names to match API schema
      const apiData = {
        name: data.fullName,
        email: data.email,
        countryCode: data.countryCode,
        phone: data.phone,
        dealershipName: data.dealershipName,
        dealerWebsite: data.dealerWebsite || undefined,
        message: data.message,
      };
      return await apiRequest("POST", "/api/leads", apiData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    createLeadMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <section id="signup-section" className="py-8 md:py-20 lg:py-28 gradient-bg-subtle">
        <div className="max-w-2xl mx-auto px-6 md:px-8 lg:px-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary-purple flex items-center justify-center shadow-2xl">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="font-bold text-4xl md:text-5xl mb-6 gradient-text-blue-purple">
            Thank You!
          </h3>
          <p className="text-foreground text-lg mb-8 leading-relaxed">
            We've received your demo request. Our team will reach out within 24 hours to schedule a personalized demonstration of DealerDelight.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at hello@dealerdelight.com
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="signup-section" className="py-16 md:py-24 lg:py-32 gradient-bg-subtle">
      <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="gradient-text-blue-purple">Ready to Sell More Cars Online?</span>
          </h2>
          <p className="text-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-2">
            Book your free demo. See your dealership online in 24 hours.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Smith" 
                        {...field} 
                        className="h-12 text-base border-2 focus:border-primary"
                        data-testid="input-full-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Work Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="john@yourdealership.com" 
                        {...field} 
                        className="h-12 text-base border-2 focus:border-primary"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-[140px_1fr] gap-3">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2" data-testid="select-country-code">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRY_CODES.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="555-123-4567" 
                          {...field} 
                          className="h-12 text-base border-2 focus:border-primary"
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dealershipName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Dealership Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Dealership Name" 
                        {...field} 
                        className="h-12 text-base border-2 focus:border-primary"
                        data-testid="input-dealership-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dealerWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Dealer Website (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="url"
                        placeholder="https://yourdealership.com" 
                        {...field} 
                        className="h-12 text-base border-2 focus:border-primary"
                        data-testid="input-dealer-website"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Tell Us About Your Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What features are most important to your dealership? How many vehicles do you typically have in inventory?" 
                        {...field} 
                        className="min-h-32 text-base resize-none border-2 focus:border-primary"
                        data-testid="input-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full gradient-bg text-white py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                disabled={createLeadMutation.isPending}
                data-testid="button-book-demo"
              >
                {createLeadMutation.isPending ? "Sending Request..." : "Book My Free Demo"}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                We'll contact you within 24 hours to schedule your personalized demo
              </p>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
