import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Car, Coffee, MapPin, Tv, Users, Wifi } from "lucide-react";
import BookingForm from "../components/BookingForm";
import ImageGallery from "../components/ImageGallery";
import { useGetListingsByPrice } from "../hooks/useListings";

export default function ListingDetail() {
  const { listingId } = useParams({ strict: false });
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const { data: listings = [], isLoading } = useGetListingsByPrice();

  const listing = listings.find((l) => l.id === listingId);
  const refCode = (search as any)?.ref || null;

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-96 w-full rounded-lg mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <Button onClick={() => navigate({ to: "/listings" })}>
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <ImageGallery images={listing.images} />

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {listing.name}
            </h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{listing.location}</span>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">About this place</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </CardContent>
          </Card>

          {listing.amenities.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-muted">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <BookingForm listing={listing} referralCode={refCode} />
        </div>
      </div>
    </div>
  );
}

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet"))
    return <Wifi className="h-4 w-4" />;
  if (lower.includes("parking") || lower.includes("car"))
    return <Car className="h-4 w-4" />;
  if (lower.includes("kitchen") || lower.includes("coffee"))
    return <Coffee className="h-4 w-4" />;
  if (lower.includes("tv") || lower.includes("television"))
    return <Tv className="h-4 w-4" />;
  return <Users className="h-4 w-4" />;
}
