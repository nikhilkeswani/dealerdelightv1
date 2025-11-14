import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Mail, Calendar, CreditCard, Clock, AlertCircle } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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

const features = [
  "Professional website templates",
  "Built-in CRM & lead management",
  "Unlimited vehicle listings",
  "Mobile-responsive design",
  "Analytics & reporting dashboard",
  "Priority customer support",
  "SEO optimization",
  "Custom domain support",
];

export default function Billing() {
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      setLocation("/login");
    }
  }, [error, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const daysRemaining = data?.dealership 
    ? Math.max(0, differenceInDays(new Date(data.dealership.trialEndsAt), new Date()))
    : 0;

  const totalTrialDays = data?.dealership
    ? differenceInDays(new Date(data.dealership.trialEndsAt), new Date(data.dealership.trialStartsAt))
    : 14;

  const trialProgress = Math.max(0, Math.min(100, ((totalTrialDays - daysRemaining) / totalTrialDays) * 100));
  const isTestingEmail = data?.user ? TESTING_EMAILS.includes(data.user.email.toLowerCase()) : false;
  const trialExpired = daysRemaining === 0;

  const getTrialStatus = () => {
    if (daysRemaining > 7) return { variant: "default" as const, color: "text-green-600", bgColor: "bg-green-100" };
    if (daysRemaining > 3) return { variant: "default" as const, color: "text-orange-600", bgColor: "bg-orange-100" };
    return { variant: "destructive" as const, color: "text-red-600", bgColor: "bg-red-100" };
  };

  const trialStatus = getTrialStatus();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Billing & Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment information
        </p>
      </div>

      {/* Trial Status Card */}
      <Card className={`border-2 ${trialExpired ? 'border-destructive/50' : 'border-primary/30'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Trial Status
              </CardTitle>
              <CardDescription>
                {trialExpired && !isTestingEmail 
                  ? "Your trial has ended"
                  : `Your trial ends on ${data.dealership ? format(new Date(data.dealership.trialEndsAt), 'MMMM d, yyyy') : ''}`
                }
              </CardDescription>
            </div>
            <Badge variant={trialStatus.variant} className="text-lg px-4 py-2" data-testid="badge-trial-days">
              {daysRemaining} days left
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Trial Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(trialProgress)}% used</span>
            </div>
            <Progress value={trialProgress} className="h-2" />
          </div>

          {trialExpired && !isTestingEmail && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Trial Expired</AlertTitle>
              <AlertDescription>
                Upgrade now to keep your dealership website live and continue growing your business.
              </AlertDescription>
            </Alert>
          )}

          {!trialExpired && daysRemaining <= 3 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Trial Ending Soon</AlertTitle>
              <AlertDescription>
                Your trial ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}. Upgrade now to avoid any interruption.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Plan */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary-purple/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Premium Plan</CardTitle>
              <CardDescription>Launch special pricing - Lock in the rate forever</CardDescription>
            </div>
            <Badge className={trialStatus.bgColor} variant="outline">
              <span className={trialStatus.color}>Launch Offer</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground line-through mb-1">
              Regular Price: €249/month
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold gradient-text-blue-purple" data-testid="text-price">€199</span>
              <span className="text-muted-foreground text-xl">/month</span>
            </div>
            <div className="mt-3 inline-block bg-success/10 text-success px-3 py-1 rounded text-sm font-semibold">
              Save €600/year • First 50 customers
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-4 gap-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Contact Us to Upgrade</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Email us to set up your subscription and payment method
                  </p>
                  <a
                    href="mailto:sales@dealerdelight.com"
                    className="text-primary hover:underline text-sm font-medium"
                    data-testid="link-email-sales"
                  >
                    sales@dealerdelight.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Schedule a Call</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll walk you through the upgrade process and answer any questions
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" data-testid="button-contact-sales">
              <Mail className="h-4 w-4 mr-2" />
              Contact Sales to Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method (Coming Soon) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Automated payment processing coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Self-service payment integration is being built</p>
              <p className="text-sm mt-2">For now, please contact sales to set up your payment method</p>
            </div>
            <Badge variant="secondary">Coming in Phase 2</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
