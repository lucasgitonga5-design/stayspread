import { Heart } from "lucide-react";
import { SiInstagram, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "stayspread",
  );

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-lg mb-3">StaySpread</h3>
            <p className="text-sm text-muted-foreground">
              Turn every traveler into a travel agent. Earn commissions by
              sharing amazing stays.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/listings"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse Properties
                </a>
              </li>
              <li>
                <a
                  href="/host-dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  List Your Property
                </a>
              </li>
              <li>
                <a
                  href="/promoter-dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Become a Promoter
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiX className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {currentYear} StaySpread. Built with{" "}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
