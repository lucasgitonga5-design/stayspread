import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { PropertyListing } from "../backend";
import CreateListingForm from "../components/CreateListingForm";
import EditListingForm from "../components/EditListingForm";
import StripeSetup from "../components/StripeSetup";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDeleteListing, useGetListingsByPrice } from "../hooks/useListings";
import { useGetCallerUserProfile } from "../hooks/useUserProfile";

export default function HostDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: allListings = [], isLoading } = useGetListingsByPrice();
  const deleteListing = useDeleteListing();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(
    null,
  );

  const isAuthenticated = !!identity;
  const isHost = userProfile?.role === "host";
  const myListings = allListings.filter(
    (listing) =>
      listing.host.toString() === identity?.getPrincipal().toString(),
  );

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      await deleteListing.mutateAsync(listingId);
      toast.success("Listing deleted successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error("Failed to delete listing");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Please login to access the host dashboard
        </h1>
      </div>
    );
  }

  if (!isHost) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          Only hosts can access this dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <StripeSetup />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Host Dashboard</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Property
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your listings...</p>
        </div>
      ) : myListings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start earning by listing your first property
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Listing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map((listing) => (
            <Card key={listing.id}>
              <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                <img
                  src={
                    listing.images[0]?.getDirectURL() ||
                    "/assets/generated/placeholder-property.dim_800x600.png"
                  }
                  alt={listing.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{listing.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {listing.location}
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold">
                    ${Number(listing.pricePerNight)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ night</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingListing(listing)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleteListing.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateListingForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
      />
      <EditListingForm
        listing={editingListing}
        open={!!editingListing}
        onOpenChange={(open) => !open && setEditingListing(null)}
      />
    </div>
  );
}
