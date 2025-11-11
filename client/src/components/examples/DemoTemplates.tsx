import DemoTemplates from '../DemoTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DemoTemplatesExample() {
  return (
    <div className="p-8">
      <Tabs defaultValue="classic" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="classic">Classic</TabsTrigger>
          <TabsTrigger value="luxury">Luxury</TabsTrigger>
          <TabsTrigger value="modern">Modern</TabsTrigger>
        </TabsList>
        <TabsContent value="classic">
          <DemoTemplates variant="classic" />
        </TabsContent>
        <TabsContent value="luxury">
          <DemoTemplates variant="luxury" />
        </TabsContent>
        <TabsContent value="modern">
          <DemoTemplates variant="modern" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
