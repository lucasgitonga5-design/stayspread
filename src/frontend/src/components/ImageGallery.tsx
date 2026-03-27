import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ExternalBlob } from "../backend";

interface ImageGalleryProps {
  images: ExternalBlob[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-[21/9] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  const mainImage = images[0].getDirectURL();
  const hasMultiple = images.length > 1;

  return (
    <>
      <div className="grid grid-cols-4 gap-2 rounded-lg overflow-hidden">
        <button
          type="button"
          className="col-span-4 md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto cursor-pointer p-0 border-0 bg-transparent"
          onClick={() => setSelectedIndex(0)}
        >
          <img
            src={mainImage}
            alt="Property main"
            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
          />
        </button>
        {hasMultiple &&
          images.slice(1, 5).map((image, index) => (
            <button
              key={image.getDirectURL()}
              type="button"
              className="aspect-[4/3] cursor-pointer hidden md:block p-0 border-0 bg-transparent"
              onClick={() => setSelectedIndex(index + 1)}
            >
              <img
                src={image.getDirectURL()}
                alt={`Property ${index + 2}`}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </button>
          ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogContent className="max-w-4xl p-0">
          {selectedIndex !== null && (
            <div className="relative">
              <img
                src={images[selectedIndex].getDirectURL()}
                alt={`Property ${selectedIndex + 1}`}
                className="w-full h-auto"
              />
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setSelectedIndex(
                        (selectedIndex - 1 + images.length) % images.length,
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setSelectedIndex((selectedIndex + 1) % images.length)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
