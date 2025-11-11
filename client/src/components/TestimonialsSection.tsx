import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import testimonial1 from "@assets/stock_images/professional_busines_c76ca393.jpg";
import testimonial2 from "@assets/stock_images/professional_busines_c3aa7ee7.jpg";
import testimonial3 from "@assets/stock_images/professional_busines_e9f909b9.jpg";

const testimonials = [
  {
    name: "Michael Rodriguez",
    role: "Owner, Elite Auto Sales",
    image: testimonial1,
    quote: "DealerDelight transformed our business. We went from 5 online sales per month to 47. The platform pays for itself many times over.",
    result: "+840% online sales",
    altText: "Michael Rodriguez, Owner of Elite Auto Sales dealership using DealerDelight CRM"
  },
  {
    name: "Sarah Chen",
    role: "General Manager, Premium Motors",
    image: testimonial2,
    quote: "Finally, a platform that actually works for car dealers. Our website looks amazing and the CRM keeps our team organized. Worth every penny.",
    result: "3x more qualified leads",
    altText: "Sarah Chen, General Manager at Premium Motors auto dealership"
  },
  {
    name: "James Thompson",
    role: "Owner, Thompson Automotive Group",
    image: testimonial3,
    quote: "We saved over $10,000 in the first year by ditching our expensive agency. DealerDelight gives us everything we need at a fraction of the cost.",
    result: "$10K+ saved annually",
    altText: "James Thompson, Owner of Thompson Automotive Group dealership"
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-10 md:py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="font-heading font-semibold text-3xl md:text-4xl lg:text-5xl mb-6">
            Loved by Dealership Owners
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            See how DealerDelight is helping dealerships sell more cars and grow their business
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-10 hover-elevate active-elevate-2 transition-all border" data-testid={`testimonial-${index}`}>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-foreground text-base leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.altText}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <div className="text-sm font-medium text-primary">{testimonial.result}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
