import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Mail, Phone, Calendar, Car, MessageSquare, Filter, Search, CheckCircle2, XCircle, Clock, PhoneCall, MailIcon, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedLeads, setExpandedLeads] = useState<Set<string>>(new Set());
  
  const { data: userData } = useQuery<{ user: any; dealership: Dealership; vehicleCount: number }>({
    queryKey: ["/api/auth/me"],
  });
  
  const dealership = userData?.dealership;

  const { data: inquiries = [], isLoading, error } = useQuery<Inquiry[]>({
    queryKey: ["/api/dealerships", dealership?.id, "inquiries"],
    enabled: !!dealership?.id,
  });

  // Update inquiry status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ inquiryId, status }: { inquiryId: string; status: string }) => {
      console.log("🔄 Updating status:", { inquiryId, status });
      await apiRequest("PATCH", `/api/inquiries/${inquiryId}/status`, { status });
      console.log("✅ Status update API call completed");
    },
    onSuccess: async () => {
      console.log("✅ Status updated successfully, refreshing data...");
      // Force refetch the inquiries
      await queryClient.refetchQueries({ 
        queryKey: ["/api/dealerships", dealership?.id, "inquiries"],
        exact: true,
      });
      toast({
        title: "Status Updated",
        description: "Lead status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Status update failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete inquiry mutation
  const deleteInquiryMutation = useMutation({
    mutationFn: async (inquiryId: string) => {
      await apiRequest("DELETE", `/api/inquiries/${inquiryId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealerships", dealership?.id, "inquiries"] });
      toast({
        title: "Lead Deleted",
        description: "The lead has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleExpanded = (inquiryId: string) => {
    setExpandedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inquiryId)) {
        newSet.delete(inquiryId);
      } else {
        newSet.add(inquiryId);
      }
      return newSet;
    });
  };

  // Filter and search inquiries
  const filteredInquiries = inquiries?.filter((inquiry) => {
    const matchesSearch = 
      inquiry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.customerPhone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "contacted": return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "won": return "bg-green-500/10 text-green-700 border-green-200";
      case "lost": return "bg-gray-500/10 text-gray-700 border-gray-200";
      default: return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <Clock className="h-3 w-3" />;
      case "contacted": return <PhoneCall className="h-3 w-3" />;
      case "won": return <CheckCircle2 className="h-3 w-3" />;
      case "lost": return <XCircle className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Customer Inquiries</h2>
          <p className="text-muted-foreground">
            Track and manage leads from your dealership website
          </p>
        </div>
      </div>

      {/* Stats Cards - Clickable Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          onClick={() => setStatusFilter("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-inquiries">
              {inquiries.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${
            statusFilter === "new" ? "border-blue-500 border-2" : "border-blue-200"
          } bg-blue-50/50`}
          onClick={() => setStatusFilter("new")}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700" data-testid="text-new-inquiries">
              {inquiries.filter(i => i.status === "new").length}
            </div>
            <p className="text-xs text-blue-600 mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${
            statusFilter === "contacted" ? "border-yellow-500 border-2" : "border-yellow-200"
          } bg-yellow-50/50`}
          onClick={() => setStatusFilter("contacted")}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PhoneCall className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {inquiries.filter(i => i.status === "contacted").length}
            </div>
            <p className="text-xs text-yellow-600 mt-1">Follow up</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${
            statusFilter === "won" ? "border-green-500 border-2" : "border-green-200"
          } bg-green-50/50`}
          onClick={() => setStatusFilter("won")}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {inquiries.filter(i => i.status === "won").length}
            </div>
            <p className="text-xs text-green-600 mt-1">Converted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      {filteredInquiries && filteredInquiries.length > 0 ? (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => {
            const isExpanded = expandedLeads.has(inquiry.id);
            return (
              <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate" data-testid={`text-customer-name-${inquiry.id}`}>
                          {inquiry.customerName}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(inquiry.status)} flex-shrink-0`}
                          data-testid={`badge-status-${inquiry.id}`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(inquiry.status)}
                            <span className="hidden sm:inline">{inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}</span>
                          </span>
                        </Badge>
                        {inquiry.vehicleId && getVehicleTitle(inquiry.vehicleId) && (
                          <Badge variant="secondary" className="hidden md:flex items-center gap-1 flex-shrink-0">
                            <Car className="h-3 w-3" />
                            <span className="max-w-[150px] truncate">{getVehicleTitle(inquiry.vehicleId)}</span>
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span data-testid={`text-inquiry-date-${inquiry.id}`}>
                            {format(new Date(inquiry.createdAt), "MMM d, h:mm a")}
                          </span>
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <MailIcon className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">{inquiry.customerEmail}</span>
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {inquiry.customerPhone}
                        </span>
                      </CardDescription>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select 
                        value={inquiry.status} 
                        onValueChange={(value) => updateStatusMutation.mutate({ inquiryId: inquiry.id, status: value })}
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpanded(inquiry.id)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Lead?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this lead from <strong>{inquiry.customerName}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteInquiryMutation.mutate(inquiry.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <CardContent className="space-y-3 pt-0">
                    {/* Vehicle Info - Compact */}
                    {inquiry.vehicleId && getVehicleTitle(inquiry.vehicleId) && (
                      <div className="flex items-center gap-2 p-2 bg-primary/5 rounded border border-primary/20">
                        <Car className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Vehicle Interest</p>
                          <p className="text-sm font-medium text-primary truncate" data-testid={`text-inquiry-vehicle-${inquiry.id}`}>
                            {getVehicleTitle(inquiry.vehicleId)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Customer Message - Compact */}
                    <div className="bg-muted/30 p-3 rounded">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                      <p className="text-sm leading-relaxed" data-testid={`text-inquiry-message-${inquiry.id}`}>
                        {inquiry.message}
                      </p>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <a href={`tel:${inquiry.customerPhone}`}>
                          <PhoneCall className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <a href={`mailto:${inquiry.customerEmail}`}>
                          <MailIcon className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
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
