import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useUserProfile";

export default function ProfileSetup() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.traveler);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      await saveProfile.mutateAsync({ name: name.trim(), role });
      toast.success("Profile created successfully!");
    } catch (error) {
      console.error("Profile setup error:", error);
      toast.error("Failed to create profile. Please try again.");
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to StaySpread!</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-3">
            <Label>I want to...</Label>
            <RadioGroup
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserRole.traveler} id="traveler" />
                <Label
                  htmlFor="traveler"
                  className="font-normal cursor-pointer"
                >
                  Book amazing stays (Traveler)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserRole.host} id="host" />
                <Label htmlFor="host" className="font-normal cursor-pointer">
                  List my property (Host)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserRole.promoter} id="promoter" />
                <Label
                  htmlFor="promoter"
                  className="font-normal cursor-pointer"
                >
                  Earn commissions by sharing (Promoter)
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? "Creating Profile..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
