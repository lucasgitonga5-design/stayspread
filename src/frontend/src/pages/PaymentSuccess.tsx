import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was successful. You'll receive a confirmation email
            shortly with all the details.
          </p>
          <Link to="/listings">
            <Button size="lg" className="w-full">
              Browse More Properties
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
