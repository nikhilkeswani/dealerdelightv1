import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, CheckCircle2, Users, Car } from "lucide-react";
import { differenceInDays } from "date-fns";

// Testing emails that bypass trial restrictions
const TESTING_EMAILS = ['demo@dealerdelight.com'];

type UserData = {
  user: {
    id: string;
    email: string;
    dealershipId: string;
  };
  dealership: {
    id: string;
    name: string;
    slug: string;
    templateStyle: string;
    trialStartsAt: string;
    trialEndsAt: string;
    subscriptionStatus: string;
  } | null;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      // Not authenticated, redirect to login
      setLocation("/login");
    }
  }, [error, setLocation]);

  useEffect(() => {
    if (data?.dealership && data?.user) {
      const now = new Date();
      const trialEnds = new Date(data.dealership.trialEndsAt);
      const isTestingEmail = TESTING_EMAILS.includes(data.user.email.toLowerCase());
      
      // If trial expired and still in trial status, redirect to upgrade (skip for testing emails)
      if (!isTestingEmail && trialEnds < now && data.dealership.subscriptionStatus === "trial") {
        setLocation("/upgrade");
      }
    }
  }, [data, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary-purple/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const dealership = data.dealership;
  const daysRemaining = dealership 
    ? Math.max(0, differenceInDays(new Date(dealership.trialEndsAt), new Date()))
    : 0;

  const getTrialBannerVariant = () => {
    if (daysRemaining > 3) return "default";
    if (daysRemaining >= 1) return "default"; // Yellow styling via custom className
    return "destructive";
  };

  const getTrialBannerMessage = () => {
    if (daysRemaining === 0) {
      return "Your trial ends today! Upgrade now to keep your dealership website live.";
    }
    if (daysRemaining === 1) {
      return "Your trial ends in 1 day. Upgrade now to avoid any interruption.";
    }
    return `Your trial ends in ${daysRemaining} days.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary-purple/10">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text-blue-purple">
                DealerDelight
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground" data-testid="text-user-email">
                {data.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-logout"
                onClick={async () => {
                  try {
                    await fetch("/api/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });
                  } catch (error) {
                    console.error("Logout error:", error);
                  } finally {
                    setLocation("/");
                  }
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {dealership && (
          <Alert 
            variant={getTrialBannerVariant()}
            className={`mb-8 ${daysRemaining > 0 && daysRemaining <= 3 ? 'border-orange-300 bg-orange-50 text-orange-900' : ''}`}
            data-testid="alert-trial-countdown"
          >
            <Clock className="h-4 w-4" />
            <AlertTitle className="text-lg font-semibold">
              Trial Status: {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{getTrialBannerMessage()}</span>
              <Button
                variant={daysRemaining <= 3 ? "default" : "outline"}
                size="sm"
                data-testid="button-upgrade"
                onClick={() => setLocation("/upgrade")}
              >
                Upgrade Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" data-testid="text-welcome">
            Welcome back, {dealership?.name || "Dealer"}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your dealership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-vehicle-count">0</div>
              <p className="text-xs text-muted-foreground">No vehicles added yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-lead-count">0</div>
              <p className="text-xs text-muted-foreground">No leads received yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Website Status</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                {dealership?.slug}.dealerdelight.com
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Complete these steps to launch your dealership website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Create your account</h3>
                <p className="text-sm text-muted-foreground">You've successfully created your account!</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-muted p-2">
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Choose your template</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Select from Luxury, Classic, or Modern website templates
                </p>
                <Button
                  size="sm"
                  data-testid="button-choose-template"
                  onClick={() => setLocation("/settings")}
                >
                  Go to Settings
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-muted p-2">
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Add your first vehicle</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Start building your inventory with photos and details
                </p>
                <Button
                  size="sm"
                  data-testid="button-add-first-vehicle"
                  onClick={() => setLocation("/add-vehicle")}
                >
                  Add Vehicle
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-muted p-2">
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Manage your inventory</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  View, edit, and organize all your vehicles in one place
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  data-testid="button-view-inventory"
                  onClick={() => setLocation("/inventory")}
                >
                  View Inventory
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-muted p-2">
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Preview your website</h3>
                <p className="text-sm text-muted-foreground">Coming soon - See how your dealership looks to customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
