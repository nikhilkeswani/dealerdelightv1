import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <section id="contact-form" className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 to-[hsl(25_95%_55%)]/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
            Ready to Transform Your Dealership?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
            Book a free demo and see how DealerDelight can help you sell more cars online
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
