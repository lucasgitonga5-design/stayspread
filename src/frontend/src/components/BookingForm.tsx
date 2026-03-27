import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PropertyListing } from "../backend";
import { useCreateBooking } from "../hooks/useBooking";
import { useCreateCheckoutSession } from "../hooks/useCheckout";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface BookingFormProps {
  listing: PropertyListing;
  referralCode: string | null;
}

export default function BookingForm({
  listing,
  referralCode,
}: BookingFormProps) {
  const { identity } = useInternetIdentity();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const createBooking = useCreateBooking();
  const createCheckoutSession = useCreateCheckoutSession();

  const isAuthenticated = !!identity;

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const totalPrice = Number(listing.pricePerNight) * nights;

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book this property");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      const checkInTime = BigInt(checkIn.getTime() * 1_000_000);
      const checkOutTime = BigInt(checkOut.getTime() * 1_000_000);

      await createBooking.mutateAsync({
        listingId: listing.id,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        promoterCode: referralCode,
      });

      const session = await createCheckoutSession.mutateAsync([
        {
          productName: listing.name,
          productDescription: `${nights} night${nights > 1 ? "s" : ""} at ${listing.location}`,
          priceInCents: BigInt(totalPrice * 100),
          currency: "usd",
          quantity: BigInt(1),
        },
      ]);

      if (!session?.url) {
        throw new Error("Stripe session missing url");
      }

      window.location.href = session.url;
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(
        error.message || "Failed to create booking. Please try again.",
      );
    }
  };

  const isLoading = createBooking.isPending || createCheckoutSession.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-3xl">${Number(listing.pricePerNight)}</span>
          <span className="text-base font-normal text-muted-foreground">
            / night
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn ? format(checkIn, "MMM dd") : "Check-in"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut ? format(checkOut, "MMM dd") : "Check-out"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => date <= (checkIn || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>

        {nights > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>
                ${Number(listing.pricePerNight)} × {nights} night
                {nights > 1 ? "s" : ""}
              </span>
              <span>${totalPrice}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleBook}
          disabled={isLoading || !checkIn || !checkOut}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Book Now"
          )}
        </Button>

        {referralCode && (
          <p className="text-xs text-center text-muted-foreground">
            Booking through referral code: {referralCode}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
