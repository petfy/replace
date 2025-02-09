
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const platforms = [
  { name: "Shopify", active: true },
  { name: "Vtex", active: false },
  { name: "Wix", active: false },
  { name: "Woocommerce", active: false },
  { name: "TiendaNube", active: false },
  { name: "Jumpseller", active: false },
  { name: "Prestashop", active: false },
];

export const PlatformsCarousel = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Compatible con:</h2>
        <div className="mx-auto max-w-5xl">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              containScroll: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {platforms.map((platform, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="flex flex-col items-center justify-center p-4">
                    <div
                      className={cn(
                        "w-24 h-24 flex items-center justify-center rounded-lg bg-gray-100 mb-2",
                        !platform.active && "grayscale opacity-50"
                      )}
                    >
                      <span className={cn(
                        "text-lg font-semibold",
                        platform.active ? "text-primary" : "text-gray-500"
                      )}>
                        {platform.name}
                      </span>
                    </div>
                    {!platform.active && (
                      <span className="text-sm text-gray-500 mt-2">¡Muy Pronto!</span>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
};
