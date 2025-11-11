import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Package, BarChart, Globe, TrendingUp, DollarSign, Mail, Phone, Eye } from "lucide-react";
import bmwX5Image from "@assets/Screenshot_16-10-2025_224110_www.bmw.ie.jpeg";

// Vehicle images for inventory display
const vehicleImages = {
  bmw3Series: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80",
  mercedesCClass: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80",
  audiA4: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&auto=format&fit=crop&q=80",
  bmwX5: bmwX5Image
};

const tabs = [
  { id: "crm", label: "CRM Dashboard", icon: Users },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "website", label: "Website Builder", icon: Globe }
];

export default function PlatformDemo() {
  const [activeTab, setActiveTab] = useState("crm");

  return (
    <section id="platform-demo" className="py-8 md:py-20 lg:py-28 gradient-bg-subtle">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="gradient-text-blue-purple">See Your Platform</span>
            <br />
            <span className="text-foreground">In Action</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Everything you need to run your dealership online — CRM, inventory management, analytics, and beautiful websites — all in one place
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="lg"
              className={activeTab === tab.id ? "gradient-bg text-white" : ""}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative">
          {/* CRM Dashboard */}
          {activeTab === "crm" && (
            <div className="animate-in fade-in duration-500">
              <Card className="p-8 md:p-10 shadow-2xl border-2" data-testid="demo-crm">
                <h3 className="text-2xl font-semibold mb-6 text-foreground">Customer Relationship Management</h3>
                
                <div className="space-y-4">
                  {/* Lead Item 1 */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gradient-to-r from-primary/5 to-primary-purple/5 rounded-xl border border-primary/20 hover-elevate gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-purple flex items-center justify-center text-white font-semibold">
                        JD
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground">John Doe</div>
                        <div className="text-sm text-muted-foreground">
                          <div className="truncate"><Mail className="h-3 w-3 inline mr-1" /> john@example.com</div>
                          <div><Phone className="h-3 w-3 inline mr-1" /> (555) 123-4567</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:text-right md:flex-shrink-0">
                      <div className="text-sm font-medium text-foreground">2024 BMW X5</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>

                  {/* Lead Item 2 */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl border border-accent/20 hover-elevate gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-semibold">
                        SM
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground">Sarah Miller</div>
                        <div className="text-sm text-muted-foreground">
                          <div className="truncate"><Mail className="h-3 w-3 inline mr-1" /> sarah.m@example.com</div>
                          <div><Phone className="h-3 w-3 inline mr-1" /> (555) 987-6543</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:text-right md:flex-shrink-0">
                      <div className="text-sm font-medium text-foreground">2023 Tesla Model 3</div>
                      <div className="text-xs text-muted-foreground">1 day ago</div>
                    </div>
                  </div>

                  {/* Lead Item 3 */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gradient-to-r from-primary-purple/5 to-accent-purple/5 rounded-xl border border-primary-purple/20 hover-elevate gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-purple to-accent-purple flex items-center justify-center text-white font-semibold">
                        RJ
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground">Robert Johnson</div>
                        <div className="text-sm text-muted-foreground">
                          <div className="truncate"><Mail className="h-3 w-3 inline mr-1" /> rob.j@example.com</div>
                          <div><Phone className="h-3 w-3 inline mr-1" /> (555) 456-7890</div>
                        </div>
                      </div>
                    </div>
                    <div className="md:text-right md:flex-shrink-0">
                      <div className="text-sm font-medium text-foreground">2024 Audi Q7</div>
                      <div className="text-xs text-muted-foreground">3 days ago</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Inventory Management */}
          {activeTab === "inventory" && (
            <div className="animate-in fade-in duration-500">
              <Card className="p-8 md:p-10 shadow-2xl border-2" data-testid="demo-inventory">
                <h3 className="text-2xl font-semibold mb-6 text-foreground">Vehicle Inventory</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-card rounded-xl overflow-hidden border-2 border-border hover-elevate transition-all group">
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img src={vehicleImages.bmw3Series} alt="Auto dealership inventory management showing 2023 BMW 3 Series luxury sedan" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-foreground mb-1">2023 BMW 3 Series</div>
                      <div className="text-2xl font-bold gradient-text-blue-purple mb-2">€45,000</div>
                      <div className="text-sm text-muted-foreground mb-3">12,000 km</div>
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-view-vehicle-details">
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card rounded-xl overflow-hidden border-2 border-border hover-elevate transition-all group">
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img src={vehicleImages.mercedesCClass} alt="Auto dealership inventory management showing 2024 Mercedes C-Class premium vehicle" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-foreground mb-1">2024 Mercedes C-Class</div>
                      <div className="text-2xl font-bold gradient-text-cyan-blue mb-2">€52,900</div>
                      <div className="text-sm text-muted-foreground mb-3">8,500 km</div>
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-view-vehicle-details">
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="hidden md:block bg-card rounded-xl overflow-hidden border-2 border-border hover-elevate transition-all group">
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img src={vehicleImages.audiA4} alt="Auto dealership inventory management showing 2023 Audi A4 executive car" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-foreground mb-1">2023 Audi A4</div>
                      <div className="text-2xl font-bold gradient-text-blue-purple mb-2">€48,500</div>
                      <div className="text-sm text-muted-foreground mb-3">15,200 km</div>
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-view-vehicle-details">
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="hidden md:block bg-card rounded-xl overflow-hidden border-2 border-border hover-elevate transition-all group">
                    <div className="aspect-video bg-muted overflow-hidden relative">
                      <img src={vehicleImages.bmwX5} alt="Auto dealership inventory management showing 2024 BMW X5 luxury SUV" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="p-4">
                      <div className="font-semibold text-foreground mb-1">2024 BMW X5</div>
                      <div className="text-2xl font-bold gradient-text-blue-purple mb-2">€68,900</div>
                      <div className="text-sm text-muted-foreground mb-3">5,800 km</div>
                      <Button size="sm" variant="outline" className="w-full" data-testid="button-view-vehicle-details">
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Analytics */}
          {activeTab === "analytics" && (
            <div className="animate-in fade-in duration-500">
              <Card className="p-8 md:p-10 shadow-2xl border-2" data-testid="demo-analytics">
                <h3 className="text-2xl font-semibold mb-8 text-foreground">Business Analytics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-primary/10 to-primary-purple/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-success flex items-center gap-1 text-sm font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        +32%
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">$890,450</div>
                    <div className="text-sm text-muted-foreground">Total Revenue This Month</div>
                  </div>

                  <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                        <Package className="h-6 w-6 text-accent" />
                      </div>
                      <div className="text-success flex items-center gap-1 text-sm font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        +18%
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">23</div>
                    <div className="text-sm text-muted-foreground">Cars Sold This Month</div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-purple/10 to-accent-purple/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-purple/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-purple" />
                      </div>
                      <div className="text-success flex items-center gap-1 text-sm font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        +45%
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">47</div>
                    <div className="text-sm text-muted-foreground">Active Leads</div>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-gradient-to-br from-muted/20 to-card rounded-2xl p-6 h-48 flex items-end gap-3">
                  <div className="flex-1 flex flex-col justify-end gap-1">
                    <div className="bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-16"></div>
                    <div className="text-xs text-center text-muted-foreground">Mon</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-1">
                    <div className="bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-24"></div>
                    <div className="text-xs text-center text-muted-foreground">Tue</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-1">
                    <div className="bg-gradient-to-t from-primary to-primary/60 rounded-t-lg h-32"></div>
                    <div className="text-xs text-center text-muted-foreground">Wed</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-1">
                    <div className="bg-gradient-to-t from-accent to-accent/60 rounded-t-lg h-28"></div>
                    <div className="text-xs text-center text-muted-foreground">Thu</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-1">
                    <div className="bg-gradient-to-t from-accent to-accent/60 rounded-t-lg h-36"></div>
                    <div className="text-xs text-center text-muted-foreground">Fri</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-1">
                    <div className="bg-gradient-to-t from-primary-purple to-primary-purple/60 rounded-t-lg h-40"></div>
                    <div className="text-xs text-center text-muted-foreground">Sat</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-end gap-1">
                    <div className="bg-gradient-to-t from-primary-purple to-primary-purple/60 rounded-t-lg h-20"></div>
                    <div className="text-xs text-center text-muted-foreground">Sun</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Website Builder */}
          {activeTab === "website" && (
            <div className="animate-in fade-in duration-500">
              <Card className="p-8 md:p-10 shadow-2xl border-2" data-testid="demo-website">
                <h3 className="text-2xl font-semibold mb-6 text-foreground">Your Dealership Website</h3>
                
                <div className="bg-background rounded-2xl overflow-hidden border-2 border-border shadow-lg">
                  {/* Browser Chrome */}
                  <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/60"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500/60"></div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-background/80 rounded px-3 py-1 text-xs text-muted-foreground">
                        yourdealership.dealerdelight.com
                      </div>
                    </div>
                  </div>

                  {/* Website Content */}
                  <div className="bg-white">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)] px-4 py-2 flex items-center justify-between text-white border-b">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                          P
                        </div>
                        <span className="font-bold text-sm">Premium Auto</span>
                      </div>
                      <div className="hidden md:flex gap-3 text-xs">
                        <span>Inventory</span>
                        <span>About</span>
                        <span>Contact</span>
                      </div>
                    </div>

                    {/* Hero */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary-purple/10 px-4 py-4 text-center">
                      <h1 className="font-bold text-lg mb-1 gradient-text-blue-purple">
                        Find Your Dream Car Today
                      </h1>
                      <p className="text-muted-foreground text-xs mb-2 max-w-md mx-auto">
                        Explore our premium selection of quality vehicles
                      </p>
                      <div className="inline-block bg-gradient-to-r from-[hsl(220_85%_60%)] to-[hsl(260_75%_65%)] text-white px-3 py-1 rounded-md text-xs font-semibold">
                        View Inventory
                      </div>
                    </div>
                    
                    {/* Vehicle Grid */}
                    <div className="px-4 py-3 pb-4 bg-white">
                      <h3 className="font-semibold text-sm mb-2 gradient-text-blue-purple">Featured Vehicles</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border border-border rounded-lg overflow-hidden">
                          <img src={vehicleImages.bmw3Series} alt="Auto dealership website builder preview showing BMW 3 Series in featured vehicle showcase" className="w-full aspect-video object-cover" />
                          <div className="p-1.5 bg-card">
                            <div className="text-[10px] font-semibold mb-0.5">2023 BMW 3 Series</div>
                            <div className="text-xs font-bold gradient-text-blue-purple">€45,000</div>
                          </div>
                        </div>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <img src={vehicleImages.mercedesCClass} alt="Auto dealership website builder preview showing Mercedes C-Class in featured vehicle showcase" className="w-full aspect-video object-cover" />
                          <div className="p-1.5 bg-card">
                            <div className="text-[10px] font-semibold mb-0.5">2024 Mercedes C-Class</div>
                            <div className="text-xs font-bold gradient-text-blue-purple">€52,900</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
