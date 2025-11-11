import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Send, CheckCircle } from "lucide-react";
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  dealershipName: z.string().min(2, "Dealership name is required"),
  dealerWebsite: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
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
      return await apiRequest("POST", "/api/leads", data);
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
      <div className="text-center py-12" data-testid="form-success">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
        </div>
        <h3 className="font-heading font-bold text-3xl mb-4">Thank You!</h3>
        <p className="text-muted-foreground text-lg mb-6">
          We've received your demo request. Our team will contact you within 24 hours.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setIsSubmitted(false);
            form.reset();
          }}
          data-testid="button-submit-another"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John Smith" 
                    {...field} 
                    className="border-2 focus:border-primary"
                    data-testid="input-name"
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
                <FormLabel className="text-sm font-semibold">Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="john@dealership.com" 
                    {...field} 
                    className="border-2 focus:border-primary"
                    data-testid="input-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem>
            <FormLabel className="text-sm font-semibold">Phone Number</FormLabel>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-[140px] border-2" data-testid="select-country-code">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="555-123-4567" 
                      {...field} 
                      className="border-2 focus:border-primary flex-1"
                      data-testid="input-phone"
                    />
                  </FormControl>
                )}
              />
            </div>
            <FormMessage />
          </FormItem>
          
          <FormField
            control={form.control}
            name="dealershipName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Dealership Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Smith Auto Sales" 
                    {...field} 
                    className="border-2 focus:border-primary"
                    data-testid="input-dealership"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dealerWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Dealer Website (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://www.yoursite.com" 
                    {...field} 
                    className="border-2 focus:border-primary"
                    data-testid="input-dealer-website"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div></div>
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Message (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your dealership and what you're looking for..." 
                  {...field} 
                  className="border-2 focus:border-primary min-h-32"
                  data-testid="input-message"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-[hsl(25_95%_55%)] hover:bg-[hsl(25_95%_50%)] text-white py-6 text-lg font-semibold shadow-lg border border-[hsl(25_95%_45%)]"
          disabled={createLeadMutation.isPending}
          data-testid="button-book-demo"
        >
          {createLeadMutation.isPending ? (
            "Sending..."
          ) : (
            <>
              Book My Demo
              <Send className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
