import { Skeleton } from "@/components/ui/skeleton";
import ListingCard from "../components/ListingCard";
import { useGetListingsByPrice } from "../hooks/useListings";

const SKELETON_KEYS = Array.from({ length: 8 }, (_, i) => `skeleton-item-${i}`);

export default function ListingsBrowse() {
  const { data: listings = [], isLoading } = useGetListingsByPrice();

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Properties</h1>
        <p className="text-muted-foreground text-lg">
          Discover amazing stays recommended by real people
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No properties available yet.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
