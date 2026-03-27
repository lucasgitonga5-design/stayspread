import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PropertyListing } from "../backend";
import { useActor } from "./useActor";

export function useGetListingsByPrice() {
  const { actor, isFetching } = useActor();

  return useQuery<PropertyListing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getListingsByPriceLowToHigh();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: PropertyListing) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createListing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: PropertyListing) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateListing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteListing(listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
