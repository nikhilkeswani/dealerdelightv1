import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filter, setFilter] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { data: leads, isLoading, error } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch("/api/leads", {
        credentials: "include", // Important: include session cookie
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Session expired or invalid
          setIsAuthenticated(false);
        }
        throw new Error("Failed to fetch leads");
      }
      return response.json();
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await apiRequest("POST", "/api/admin/login", { password });

      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError("Invalid password");
      }
    } catch (error) {
      setLoginError("Invalid password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const filteredLeads = leads?.filter((lead) => {
    const searchTerm = filter.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.dealershipName.toLowerCase().includes(searchTerm) ||
      lead.dealerWebsite?.toLowerCase().includes(searchTerm) ||
      lead.phone?.includes(searchTerm) ||
      lead.countryCode?.includes(searchTerm)
    );
  });

  const exportToCSV = () => {
    if (!filteredLeads) return;

    const headers = ["Name", "Email", "Country Code", "Phone", "Dealership", "Dealer Website", "Message", "Date"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.countryCode || "",
      lead.phone || "",
      lead.dealershipName,
      lead.dealerWebsite || "",
      lead.message || "",
      new Date(lead.createdAt || "").toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-6 w-6" />
              <CardTitle>Admin Login</CardTitle>
            </div>
            <CardDescription>
              Enter the admin password to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoggingIn}
                data-testid="input-admin-password"
              />
              {loginError && (
                <p className="text-sm text-destructive" data-testid="text-login-error">
                  {loginError}
                </p>
              )}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
                data-testid="button-login"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Management Dashboard</CardTitle>
            <CardDescription>
              View and manage all demo requests from potential customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by name, email, dealership, or phone..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1"
                data-testid="input-search"
              />
              <Button
                onClick={exportToCSV}
                disabled={!filteredLeads || filteredLeads.length === 0}
                data-testid="button-export-csv"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading leads...</div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Dealership</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads && filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                          <TableCell data-testid={`text-name-${lead.id}`}>
                            {lead.name}
                          </TableCell>
                          <TableCell data-testid={`text-email-${lead.id}`}>
                            {lead.email}
                          </TableCell>
                          <TableCell data-testid={`text-phone-${lead.id}`}>
                            {lead.countryCode} {lead.phone || "-"}
                          </TableCell>
                          <TableCell data-testid={`text-dealership-${lead.id}`}>
                            {lead.dealershipName}
                          </TableCell>
                          <TableCell data-testid={`text-website-${lead.id}`}>
                            {lead.dealerWebsite ? (
                              <a 
                                href={lead.dealerWebsite} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Link
                              </a>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="max-w-xs truncate" data-testid={`text-message-${lead.id}`}>
                            {lead.message || "-"}
                          </TableCell>
                          <TableCell data-testid={`text-date-${lead.id}`}>
                            {lead.createdAt
                              ? new Date(lead.createdAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {filter ? "No leads match your search" : "No leads yet"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredLeads && (
              <div className="text-sm text-muted-foreground" data-testid="text-total-leads">
                Showing {filteredLeads.length} of {leads?.length || 0} leads
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
