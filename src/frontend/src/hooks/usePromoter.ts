import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetPromoterReferralCode() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["promoterReferralCode"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPromoterReferralCode();
    },
    enabled: !!actor && !isFetching,
  });
}
