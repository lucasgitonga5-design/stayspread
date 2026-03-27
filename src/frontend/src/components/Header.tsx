import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Building2, Home, Megaphone } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useUserProfile";

export default function Header() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isHost = userProfile?.role === "host";
  const isPromoter = userProfile?.role === "promoter";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Home className="h-6 w-6" />
            <span>StaySpread</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/listings"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Browse Properties
            </Link>
            {isAuthenticated && isHost && (
              <Link
                to="/host-dashboard"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <Building2 className="h-4 w-4" />
                Host Dashboard
              </Link>
            )}
            {isAuthenticated && isPromoter && (
              <Link
                to="/promoter-dashboard"
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <Megaphone className="h-4 w-4" />
                Promoter Dashboard
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LoginButton />
        </div>
      </div>
    </header>
  );
}

function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { refetch } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";
  const text =
    loginStatus === "logging-in"
      ? "Logging in..."
      : isAuthenticated
        ? "Logout"
        : "Login";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      window.location.href = "/";
    } else {
      try {
        await login();
        await refetch();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? "outline" : "default"}
    >
      {text}
    </Button>
  );
}
