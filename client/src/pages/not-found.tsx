import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary-purple/5">
      <Card className="w-full max-w-lg mx-4 shadow-xl">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground text-center mb-4">
            Page Not Found
          </h1>

          <p className="text-muted-foreground text-center mb-8 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. The page may have been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => setLocation('/')}
              className="gradient-bg text-white"
              data-testid="button-go-home"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.history.back()}
              data-testid="button-go-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a 
                href="/#platform-demo" 
                className="text-sm text-primary hover:underline"
                data-testid="link-features"
              >
                Features
              </a>
              <a 
                href="/#pricing" 
                className="text-sm text-primary hover:underline"
                data-testid="link-pricing"
              >
                Pricing
              </a>
              <a 
                href="/demo" 
                className="text-sm text-primary hover:underline"
                data-testid="link-demo"
              >
                Demo Templates
              </a>
              <a 
                href="/#signup-section" 
                className="text-sm text-primary hover:underline"
                data-testid="link-contact"
              >
                Contact Us
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
