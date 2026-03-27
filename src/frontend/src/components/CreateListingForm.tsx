import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateListing } from "../hooks/useListings";

interface CreateListingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateListingForm({
  open,
  onOpenChange,
}: CreateListingFormProps) {
  const { identity } = useInternetIdentity();
  const createListing = useCreateListing();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {},
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ExternalBlob[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress(
        (percentage) => {
          setUploadProgress((prev) => ({
            ...prev,
            [images.length + i]: percentage,
          }));
        },
      );
      newImages.push(blob);
    }

    setImages([...images, ...newImages]);
    setUploadProgress({});
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error("Please login first");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    const price = Number.parseInt(pricePerNight);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      await createListing.mutateAsync({
        id: `listing-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        pricePerNight: BigInt(price),
        amenities: amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        images,
        host: identity.getPrincipal(),
      });

      toast.success("Listing created successfully!");
      onOpenChange(false);

      // Reset form
      setName("");
      setDescription("");
      setLocation("");
      setPricePerNight("");
      setAmenities("");
      setImages([]);
    } catch (error: any) {
      console.error("Create listing error:", error);
      toast.error(error.message || "Failed to create listing");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Beautiful Beach House"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Malibu, California"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per Night (USD) *</Label>
            <Input
              id="price"
              type="number"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="150"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your property..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input
              id="amenities"
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="WiFi, Parking, Kitchen, Pool"
            />
          </div>

          <div className="space-y-2">
            <Label>Images *</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Click to upload images</span>
                </div>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((image, index) => (
                  <div
                    key={image.getDirectURL()}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={image.getDirectURL()}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {uploadProgress[index] !== undefined &&
                      uploadProgress[index] < 100 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {uploadProgress[index]}%
                          </span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createListing.isPending}
              className="flex-1"
            >
              {createListing.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
