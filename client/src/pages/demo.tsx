import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DemoTemplates from "@/components/DemoTemplates";

export default function Demo() {
  const [, setLocation] = useLocation();

  // Update page title for SEO when component mounts
  useEffect(() => {
    document.title = "Dealership Website Templates - Classic, Luxury, Modern";
    
    // Restore homepage title when component unmounts
    return () => {
      document.title = "Auto Dealership CRM & Website Software | DealerDelight US, UK & Ireland";
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="bg-muted border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-3">
            Live Template Previews
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore our three stunning templates with interactive vehicle inventory displays
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Tabs defaultValue="classic" className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="classic" data-testid="tab-classic">Classic Pro</TabsTrigger>
            <TabsTrigger value="luxury" data-testid="tab-luxury">Luxury Elite</TabsTrigger>
            <TabsTrigger value="modern" data-testid="tab-modern">Modern Edge</TabsTrigger>
          </TabsList>
          
          <TabsContent value="classic" className="mt-0">
            <DemoTemplates variant="classic" />
          </TabsContent>
          
          <TabsContent value="luxury" className="mt-0">
            <DemoTemplates variant="luxury" />
          </TabsContent>
          
          <TabsContent value="modern" className="mt-0">
            <DemoTemplates variant="modern" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
