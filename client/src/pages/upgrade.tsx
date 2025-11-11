import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Mail, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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

export default function Upgrade() {
  const [, setLocation] = useLocation();

  const { data } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const daysRemaining = data?.dealership 
    ? Math.max(0, differenceInDays(new Date(data.dealership.trialEndsAt), new Date()))
    : 0;

  const isTestingEmail = data?.user ? TESTING_EMAILS.includes(data.user.email.toLowerCase()) : false;
  const trialExpired = daysRemaining === 0;

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
            <Button
              variant="outline"
              size="sm"
              data-testid="button-back-home"
              onClick={() => setLocation("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {trialExpired && !isTestingEmail ? (
            <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Calendar className="inline h-4 w-4 mr-2" />
              Trial Period Ended
            </div>
          ) : (
            <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Calendar className="inline h-4 w-4 mr-2" />
              {daysRemaining} Days Remaining in Trial
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text-blue-purple">
              {trialExpired && !isTestingEmail ? "Upgrade to Continue" : "Upgrade Your Plan"}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {trialExpired && !isTestingEmail 
              ? "Your 14-day trial has ended. Upgrade to the full version to keep your dealership website live and continue growing your business."
              : "Ready to unlock the full potential of DealerDelight? Upgrade to our premium plan and take your dealership to the next level."
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 to-primary-purple/5">
            <CardHeader>
              <CardTitle className="text-2xl">Launch Special Pricing</CardTitle>
              <CardDescription>Lock in the introductory rate forever</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground line-through mb-1">
                  Regular Price: €249/month
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold gradient-text-blue-purple">€199</span>
                  <span className="text-muted-foreground text-xl">/month</span>
                </div>
                <div className="mt-3 inline-block bg-success/10 text-success px-3 py-1 rounded text-sm font-semibold">
                  Save €600/year • First 50 customers
                </div>
              </div>

              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us to Upgrade
              </CardTitle>
              <CardDescription>
                We'll get back to you within 24 hours to set up your subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted p-6 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Email Us</h4>
                      <a
                        href="mailto:sales@dealerdelight.com"
                        className="text-primary hover:underline"
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
                    <div>
                      <h4 className="font-semibold mb-1">Schedule a Call</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll walk you through the upgrade process and answer any questions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">What happens next?</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Contact us using one of the methods above</li>
                    <li>2. We'll send you a secure payment link</li>
                    <li>3. Your website will be reactivated immediately</li>
                    <li>4. Lock in the €199/month rate forever</li>
                  </ol>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                data-testid="button-contact-sales"
                onClick={() => window.location.href = 'mailto:sales@dealerdelight.com?subject=Upgrade to Full Version'}
              >
                Contact Sales Team
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Not ready to upgrade yet?
          </p>
          <Button
            variant="outline"
            data-testid="button-back-to-login"
            onClick={() => setLocation("/login")}
          >
            Back to Login
          </Button>
        </div>
      </main>
    </div>
  );
}
