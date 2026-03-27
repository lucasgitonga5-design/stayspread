import { useMutation } from "@tanstack/react-query";
import type { Time } from "../backend";
import { useActor } from "./useActor";

interface CreateBookingParams {
  listingId: string;
  checkIn: Time;
  checkOut: Time;
  promoterCode: string | null;
}

export function useCreateBooking() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      listingId,
      checkIn,
      checkOut,
      promoterCode,
    }: CreateBookingParams) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createBooking(listingId, checkIn, checkOut, promoterCode);
    },
  });
}
