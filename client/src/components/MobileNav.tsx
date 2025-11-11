import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  const scrollToSignup = () => {
    document.getElementById('signup-section')?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <div className="md:hidden fixed top-4 right-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            variant="outline"
            className="bg-background/95 backdrop-blur-sm"
            data-testid="button-hamburger-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-4 mt-8">
            <button
              onClick={() => scrollToSection('platform-demo')}
              className="text-left text-lg font-medium hover:text-primary transition-colors"
              data-testid="nav-link-demo"
            >
              Platform Demo
            </button>
            <button
              onClick={() => scrollToSection('templates')}
              className="text-left text-lg font-medium hover:text-primary transition-colors"
              data-testid="nav-link-templates"
            >
              Templates
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-left text-lg font-medium hover:text-primary transition-colors"
              data-testid="nav-link-pricing"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-left text-lg font-medium hover:text-primary transition-colors"
              data-testid="nav-link-testimonials"
            >
              Testimonials
            </button>
            <div className="border-t pt-4 mt-4">
              <Button 
                className="w-full gradient-bg text-white"
                onClick={scrollToSignup}
                data-testid="button-book-demo-nav"
              >
                Book Free Demo
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
