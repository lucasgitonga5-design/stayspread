import { Card, CardContent } from "@/components/ui/card";
import { Link, useSearch } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { PropertyListing } from "../backend";

interface ListingCardProps {
  listing: PropertyListing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const search = useSearch({ strict: false });
  const refParam = (search as any)?.ref;

  const imageUrl =
    listing.images[0]?.getDirectURL() ||
    "/assets/generated/placeholder-property.dim_800x600.png";
  const linkTo = `/listings/${listing.id}${refParam ? `?ref=${refParam}` : ""}`;

  return (
    <Link to={linkTo}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={listing.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
            {listing.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold">
              ${Number(listing.pricePerNight)}
            </span>
            <span className="text-sm text-muted-foreground">/ night</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
