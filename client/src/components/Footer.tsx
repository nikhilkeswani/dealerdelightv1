import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background relative">
      <div className="absolute top-0 left-0 right-0 h-1 gradient-bg"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-12">
          <div>
            <h3 className="font-bold text-2xl mb-6 gradient-text-blue-purple">
              DealerDelight
            </h3>
            <p className="text-background/70 leading-relaxed text-sm">
              Modern websites and CRM platform designed specifically for auto
              dealerships.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-6 uppercase tracking-wider text-background">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/#platform-demo"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-features"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/#templates"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-templates"
                >
                  Templates
                </a>
              </li>
              <li>
                <a
                  href="/#pricing"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-pricing"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/demo"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-demo"
                >
                  Demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-6 uppercase tracking-wider text-background">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/#signup-section"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-help"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/#testimonials"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-blog"
                >
                  Success Stories
                </a>
              </li>
              <li>
                <a
                  href="/#instant-preview"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-guides"
                >
                  Try Free Demo
                </a>
              </li>
              <li>
                <a
                  href="/#signup-section"
                  className="text-background/70 hover:text-background transition-colors text-sm hover-elevate"
                  data-testid="link-api"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-6 uppercase tracking-wider text-background">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-background/70" />
                <span className="text-background/70 text-sm">
                  hello@dealerdelight.com
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-background/70" />
                <span className="text-background/70 text-sm">
                  +353 899653135
                </span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 flex-shrink-0 text-background/70" />
                <span className="text-background/70 text-sm">
                  Dublin, Ireland
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2025 DealerDelight. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a
                href="/#signup-section"
                className="text-background/60 hover:text-background text-sm transition-colors hover-elevate"
                data-testid="link-privacy"
              >
                Privacy Policy
              </a>
              <a
                href="/#signup-section"
                className="text-background/60 hover:text-background text-sm transition-colors hover-elevate"
                data-testid="link-terms"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
