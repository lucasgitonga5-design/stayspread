import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, DollarSign, Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetPromoterReferralCode } from "../hooks/usePromoter";
import { useGetCallerUserProfile } from "../hooks/useUserProfile";

export default function PromoterDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: referralCode, isLoading } = useGetPromoterReferralCode();
  const [copied, setCopied] = useState(false);

  const isAuthenticated = !!identity;
  const isPromoter = userProfile?.role === "promoter";

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "";
  const referralUrl = referralCode
    ? `${baseUrl}/listings?ref=${referralCode}`
    : "";

  const handleCopy = async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy link");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please login to access the promoter dashboard
        </h1>
      </div>
    );
  }

  if (!isPromoter) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          Only promoters can access this dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Promoter Dashboard</h1>
        <p className="text-muted-foreground">
          Share properties and earn commissions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground">
                Loading your referral code...
              </p>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-lg break-all text-sm">
                  {referralUrl}
                </div>
                <Button
                  onClick={handleCopy}
                  className="w-full"
                  disabled={!referralUrl}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Share this link to earn 8% commission on every booking!
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Commissions Earned
                </p>
                <p className="text-3xl font-bold">$0.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Bookings
                </p>
                <p className="text-2xl font-semibold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Promote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Browse Properties</h4>
                <p className="text-sm text-muted-foreground">
                  Find amazing properties you'd love to share with your audience
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Share Your Link</h4>
                <p className="text-sm text-muted-foreground">
                  Use your unique referral link when sharing properties on
                  social media, blogs, or with friends
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Earn Commissions</h4>
                <p className="text-sm text-muted-foreground">
                  Earn 8% commission on every booking made through your referral
                  link
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
