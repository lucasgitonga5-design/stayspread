import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useIsStripeConfigured,
  useSetStripeConfiguration,
} from "../hooks/useStripe";

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setStripeConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,CA,GB");

  const showSetup = !isLoading && isConfigured === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!secretKey.trim()) {
      toast.error("Please enter your Stripe secret key");
      return;
    }

    try {
      await setStripeConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countries
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      });
      toast.success("Stripe configured successfully!");
    } catch (error: any) {
      console.error("Stripe setup error:", error);
      toast.error(error.message || "Failed to configure Stripe");
    }
  };

  return (
    <Dialog open={showSetup}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Configure Stripe Payments</DialogTitle>
          <DialogDescription>
            Set up Stripe to accept payments for bookings
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            You need to configure Stripe before accepting bookings. Get your
            secret key from the{" "}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              Stripe Dashboard
            </a>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey">Stripe Secret Key *</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countries">
              Allowed Countries (comma-separated)
            </Label>
            <Input
              id="countries"
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              placeholder="US,CA,GB"
            />
            <p className="text-xs text-muted-foreground">
              Use ISO 3166-1 alpha-2 country codes (e.g., US, CA, GB)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={setStripeConfig.isPending}
          >
            {setStripeConfig.isPending ? "Configuring..." : "Configure Stripe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
