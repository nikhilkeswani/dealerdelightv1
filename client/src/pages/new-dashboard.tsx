import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Circle,
  Palette,
  Package,
  TrendingUp,
  Clock,
  Sparkles,
  Rocket,
  ArrowRight
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    address: string | null;
    phone: string | null;
    hours: string | null;
    about: string | null;
    logoUrl: string | null;
    trialStartsAt: string;
    trialEndsAt: string;
    subscriptionStatus: string;
  } | null;
  vehicleCount: number;
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (error) {
      // Session expired or not authenticated, redirect to login
      setLocation("/login");
    }
  }, [error, setLocation]);

  useEffect(() => {
    if (data?.dealership && data?.user) {
      const now = new Date();
      const trialEnds = new Date(data.dealership.trialEndsAt);
      const isTestingEmail = TESTING_EMAILS.includes(data.user.email.toLowerCase());
      
      if (!isTestingEmail && trialEnds < now && data.dealership.subscriptionStatus === "trial") {
        setLocation("/billing");
      }
    }
  }, [data, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
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

  const totalTrialDays = dealership
    ? Math.max(1, differenceInDays(new Date(dealership.trialEndsAt), new Date(dealership.trialStartsAt)))
    : 14;

  const trialProgress = Math.max(0, Math.min(100, ((totalTrialDays - daysRemaining) / totalTrialDays) * 100));

  // Calculate setup completion - 7 real steps
  const hasSelectedTemplate = dealership?.templateStyle && dealership.templateStyle !== '';
  const hasBusinessDetails = dealership?.address && dealership?.phone && dealership?.hours && dealership?.about;
  const hasLogo = dealership?.logoUrl && dealership.logoUrl !== '';
  const hasVehicle = (data?.vehicleCount || 0) > 0;
  
  const setupTasks = [
    { id: 'account', title: 'Create your account', completed: true, icon: CheckCircle2 },
    { id: 'template', title: 'Choose a template', completed: hasSelectedTemplate, icon: Palette },
    { id: 'business', title: 'Add business details', completed: hasBusinessDetails, icon: Package },
    { id: 'logo', title: 'Upload your logo', completed: hasLogo, icon: Sparkles },
    { id: 'vehicle', title: 'Add your first vehicle', completed: hasVehicle, icon: Package },
  ];
  const completedTasks = setupTasks.filter(t => t.completed).length;
  const setupProgress = (completedTasks / setupTasks.length) * 100;
  const isSetupComplete = setupProgress === 100;

  const copyToClipboard = () => {
    if (dealership?.slug) {
      navigator.clipboard.writeText(`${dealership.slug}.dealerdelight.com`);
      toast({
        title: "Copied!",
        description: "Website URL copied to clipboard.",
      });
    }
  };

  const getTrialStatus = () => {
    if (daysRemaining > 7) return { color: "text-green-600", bgColor: "bg-green-100", variant: "default" as const };
    if (daysRemaining > 3) return { color: "text-yellow-600", bgColor: "bg-yellow-100", variant: "default" as const };
    return { color: "text-red-600", bgColor: "bg-red-100", variant: "destructive" as const };
  };

  const trialStatus = getTrialStatus();

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-2 gradient-text-blue-purple" data-testid="text-welcome">
          Welcome, {dealership?.name || "Dealer"}!
        </h2>
        <p className="text-lg text-muted-foreground">
          Let's get your dealership website live in minutes
        </p>
      </div>

      {/* Trial Alert */}
      {dealership && daysRemaining <= 7 && (
        <Alert variant={trialStatus.variant} className="border-2" data-testid="alert-trial-countdown">
          <Clock className="h-5 w-5" />
          <AlertTitle className="font-bold text-lg">
            {daysRemaining === 0 ? "Trial Ended" : `${daysRemaining} ${daysRemaining === 1 ? "Day" : "Days"} Left in Trial`}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-base">
              {daysRemaining === 0 
                ? "Upgrade now to keep your dealership website live."
                : `Your trial ends on ${format(new Date(dealership.trialEndsAt), 'MMMM d, yyyy')}. Upgrade to continue.`
              }
            </span>
            <Button
              variant={daysRemaining <= 3 ? "default" : "outline"}
              size="lg"
              data-testid="button-upgrade"
              onClick={() => setLocation("/billing")}
              className="font-semibold"
            >
              Upgrade Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Progress Hero */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary-purple/5 border border-border">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold gradient-text-blue-purple">
            Your Setup Progress
          </CardTitle>
          <CardDescription className="text-lg">
            {isSetupComplete 
              ? "Congratulations! Your website is ready to launch!"
              : `${completedTasks} of ${setupTasks.length} steps completed`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Large circular progress */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - setupProgress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-purple))" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold gradient-text-blue-purple" data-testid="text-setup-progress">
                  {Math.round(setupProgress)}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Complete</div>
              </div>
            </div>
          </div>

          {/* Task list */}
          <div className="space-y-3 max-w-md mx-auto">
            {setupTasks.map((task, index) => {
              const Icon = task.icon;
              return (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    task.completed 
                      ? 'bg-success/5 border border-success/20' 
                      : 'bg-card border border-border'
                  }`}
                  data-testid={`task-${task.id}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    task.completed 
                      ? 'bg-success/20' 
                      : 'bg-muted/50'
                  }`}>
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`font-medium ${task.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {task.title}
                    </span>
                  </div>
                  {!task.completed && task.id === 'template' && (
                    <ArrowRight className="h-5 w-5 text-primary animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Website URL - Only show when setup is complete */}
      {isSetupComplete && (
        <Card className="border border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-3xl text-success">
              <Rocket className="h-8 w-8" />
              Your Website is Live!
            </CardTitle>
            <CardDescription className="text-lg">
              Share this URL with your customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 max-w-2xl mx-auto">
              <code className="flex-1 bg-background/80 px-6 py-4 rounded-lg text-xl font-semibold text-center" data-testid="text-website-url">
                {dealership?.slug}.dealerdelight.com
              </code>
              <Button
                variant="outline"
                size="lg"
                data-testid="button-copy-url"
                onClick={copyToClipboard}
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy
              </Button>
              <Button
                size="lg"
                data-testid="button-view-website"
                onClick={() => {
                  window.open(`https://${dealership?.slug}.dealerdelight.com`, "_blank");
                }}
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                View Site
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Action - Choose Template (only if not selected) */}
      {!hasSelectedTemplate && (
        <Card 
          className="border-2 border-primary/30 hover-elevate cursor-pointer transition-all bg-gradient-to-br from-primary/5 to-primary-purple/5"
          onClick={() => setLocation("/website")}
          data-testid="card-choose-template-primary"
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 rounded-2xl p-6">
                <Palette className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold gradient-text-blue-purple">Choose Your Template</CardTitle>
            <CardDescription className="text-lg">
              Pick a stunning design that represents your dealership
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" className="w-full max-w-md text-lg font-semibold gradient-bg" data-testid="button-choose-template-primary">
              Browse Templates
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next Action - Progressive Reveal */}
      {!isSetupComplete && (
        <>
          {/* Business Details Action (show after template selected) */}
          {hasSelectedTemplate && !hasBusinessDetails && (
            <Card 
              className="border-2 border-primary/30 hover-elevate cursor-pointer transition-all bg-gradient-to-br from-primary/5 to-primary-purple/5"
              onClick={() => setLocation("/business-details")}
              data-testid="card-add-business-details"
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-2xl p-6">
                    <Package className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold gradient-text-blue-purple">Add Business Details</CardTitle>
                <CardDescription className="text-lg">
                  Let customers know where to find you and how to contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" className="w-full max-w-md text-lg font-semibold gradient-bg" data-testid="button-add-business-details">
                  Add Details
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Logo Upload Action (show after business details complete) */}
          {hasSelectedTemplate && hasBusinessDetails && !hasLogo && (
            <Card 
              className="border-2 border-primary/30 hover-elevate cursor-pointer transition-all bg-gradient-to-br from-primary/5 to-primary-purple/5"
              onClick={() => setLocation("/upload-logo")}
              data-testid="card-upload-logo"
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-2xl p-6">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold gradient-text-blue-purple">Upload Your Logo</CardTitle>
                <CardDescription className="text-lg">
                  Make your website stand out with your dealership logo
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" className="w-full max-w-md text-lg font-semibold gradient-bg" data-testid="button-upload-logo">
                  Add Logo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Vehicle Action (show after logo uploaded) */}
          {hasSelectedTemplate && hasBusinessDetails && hasLogo && !hasVehicle && (
            <Card 
              className="border-2 border-primary/30 hover-elevate cursor-pointer transition-all bg-gradient-to-br from-primary/5 to-primary-purple/5"
              onClick={() => setLocation("/add-vehicle")}
              data-testid="card-add-first-vehicle"
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-2xl p-6">
                    <Package className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold gradient-text-blue-purple">Add Your First Vehicle</CardTitle>
                <CardDescription className="text-lg">
                  Start building your inventory with your first vehicle listing
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button size="lg" className="w-full max-w-md text-lg font-semibold gradient-bg" data-testid="button-add-first-vehicle">
                  Add Vehicle
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Quick Actions Grid - Only show template selection if available */}
      {hasSelectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="hover-elevate cursor-pointer transition-all bg-gradient-to-br from-primary/5 to-primary-purple/5 border border-border"
            onClick={() => setLocation("/website")} 
            data-testid="card-customize-website"
          >
            <CardHeader className="pb-3">
              <div className="bg-primary/20 rounded-xl p-4 w-fit mb-3">
                <Palette className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-xl">Customize Website</CardTitle>
              <CardDescription className="text-base">
                Change your template or customize branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" data-testid="button-customize-website">
                Customize
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer transition-all bg-gradient-to-br from-success/5 to-accent/5 border border-border" onClick={() => setLocation("/billing")} data-testid="card-upgrade-plan">
            <CardHeader className="pb-3">
              <div className="bg-success/20 rounded-xl p-4 w-fit mb-3">
                <TrendingUp className="h-7 w-7 text-success" />
              </div>
              <CardTitle className="text-xl">Upgrade Plan</CardTitle>
              <CardDescription className="text-base">
                Convert to paid plan and unlock all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" data-testid="button-upgrade-plan">
                View Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trial Status Summary */}
      {dealership && (
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-6 w-6 text-primary" />
              Trial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Started</span>
                <span className="font-semibold">{format(new Date(dealership.trialStartsAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Ends</span>
                <span className="font-semibold">{format(new Date(dealership.trialEndsAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Days Remaining</span>
                <Badge variant={trialStatus.variant} className="text-base px-3 py-1" data-testid="badge-days-remaining">
                  {daysRemaining} days
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
