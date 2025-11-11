import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const inquiryFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  vehicleId: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

type InquiryFormProps = {
  dealershipSlug: string;
  vehicleId?: string;
  vehicleTitle?: string;
  onSuccess?: () => void;
};

export function InquiryForm({ dealershipSlug, vehicleId, vehicleTitle, onSuccess }: InquiryFormProps) {
  const { toast } = useToast();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      message: vehicleTitle 
        ? `I'm interested in learning more about the ${vehicleTitle}.` 
        : "",
      vehicleId: vehicleId || undefined,
    },
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: InquiryFormValues) => {
      const response = await apiRequest("POST", `/api/public/dealerships/${dealershipSlug}/inquiries`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent!",
        description: "The dealership will contact you soon.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Inquiry",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InquiryFormValues) => {
    submitInquiry.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {vehicleTitle && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Inquiring about:</p>
            <p className="font-semibold" data-testid="text-inquiry-vehicle">
              {vehicleTitle}
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  {...field} 
                  data-testid="input-customer-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="john@example.com" 
                  {...field} 
                  data-testid="input-customer-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customerPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input 
                  type="tel" 
                  placeholder="(555) 123-4567" 
                  {...field} 
                  data-testid="input-customer-phone"
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
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="I'm interested in this vehicle. Please contact me with more information."
                  className="min-h-[120px]"
                  {...field}
                  data-testid="input-customer-message"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={submitInquiry.isPending}
          data-testid="button-submit-inquiry"
        >
          {submitInquiry.isPending ? "Sending..." : "Send Inquiry"}
        </Button>
      </form>
    </Form>
  );
}
