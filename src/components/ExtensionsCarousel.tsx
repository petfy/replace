
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const extensions = [
  { 
    name: "Chrome", 
    active: true,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/chrome.svg?v=1739114262"
  },
  { 
    name: "Firefox", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/Firefox.png?v=1739114263"
  },
  { 
    name: "Safari", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/safari.jpg?v=1739114263"
  },
  { 
    name: "App Store iOS", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/ios.png?v=1739114263"
  },
  { 
    name: "Play Store Android", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/android.png?v=1739114263"
  },
];

export const ExtensionsCarousel = () => {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Extensiones disponibles:</h2>
        <div className="mx-auto max-w-5xl">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              containScroll: false,
            }}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {extensions.map((extension, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <div className="flex flex-col items-center justify-center p-4">
                    <div
                      className={cn(
                        "flex items-center justify-center mb-2",
                        !extension.active && "grayscale opacity-50"
                      )}
                    >
                      {extension.logo ? (
                        <img 
                          src={extension.logo} 
                          alt={extension.name} 
                          className="w-32 h-20 object-contain"
                        />
                      ) : (
                        <span className={cn(
                          "text-lg font-semibold",
                          extension.active ? "text-primary" : "text-gray-500"
                        )}>
                          {extension.name}
                        </span>
                      )}
                    </div>
                    {!extension.active && (
                      <span className="text-sm text-gray-500">¡Muy Pronto!</span>
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
