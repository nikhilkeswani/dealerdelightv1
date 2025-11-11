import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Car, MessageSquare } from "lucide-react";
import { format } from "date-fns";

type Dealership = {
  id: string;
  name: string;
};

type Inquiry = {
  id: string;
  dealershipId: string;
  vehicleId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  status: string;
  createdAt: string;
};

type Vehicle = {
  id: string;
  title: string;
};

export default function Leads() {
  const { data: dealership } = useQuery<Dealership>({
    queryKey: ["/api/user/dealership"],
  });

  const { data: inquiries = [], isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/dealerships", dealership?.id, "inquiries"],
    enabled: !!dealership?.id,
  });

  // Fetch vehicles to show titles for inquiries with vehicleId
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/dealerships", dealership?.id, "vehicles"],
    enabled: !!dealership?.id,
  });

  const getVehicleTitle = (vehicleId: string | null) => {
    if (!vehicleId) return null;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.title || "Unknown Vehicle";
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Customer Inquiries</h2>
        <p className="text-muted-foreground">
          Track and respond to customer inquiries from your website
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-inquiries">
              {inquiries.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-new-inquiries">
              {inquiries.filter(i => i.status === "new").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-week-inquiries">
              {inquiries.filter(i => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(i.createdAt) > weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inquiries List */}
      {inquiries.length > 0 ? (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg" data-testid={`text-customer-name-${inquiry.id}`}>
                        {inquiry.customerName}
                      </CardTitle>
                      {inquiry.status === "new" && (
                        <Badge variant="default" data-testid={`badge-status-${inquiry.id}`}>
                          New
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span data-testid={`text-inquiry-date-${inquiry.id}`}>
                        {format(new Date(inquiry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vehicle Info */}
                {inquiry.vehicleId && getVehicleTitle(inquiry.vehicleId) && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Interested in:</p>
                      <p className="font-medium" data-testid={`text-inquiry-vehicle-${inquiry.id}`}>
                        {getVehicleTitle(inquiry.vehicleId)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Customer Message */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message:</p>
                  <p className="text-sm" data-testid={`text-inquiry-message-${inquiry.id}`}>
                    {inquiry.message}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${inquiry.customerEmail}`}
                      className="text-sm hover:underline"
                      data-testid={`link-email-${inquiry.id}`}
                    >
                      {inquiry.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${inquiry.customerPhone}`}
                      className="text-sm hover:underline"
                      data-testid={`link-phone-${inquiry.id}`}
                    >
                      {inquiry.customerPhone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="bg-muted rounded-full p-4 mb-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2" data-testid="text-no-inquiries">
              No Inquiries Yet
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              When customers submit inquiries from your public website, they'll appear here. 
              Make sure your website is live and share your URL to start receiving leads!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
