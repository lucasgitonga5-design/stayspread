import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export default function PaymentFailure() {
  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mb-6 flex justify-center">
            <XCircle className="h-20 w-20 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was cancelled or failed. No charges were made to your
            account.
          </p>
          <Link to="/listings">
            <Button size="lg" className="w-full">
              Return to Listings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
