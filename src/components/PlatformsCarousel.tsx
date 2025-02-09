
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const platforms = [
  { 
    name: "Shopify", 
    active: true,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/shopify.svg?v=1739113267"
  },
  { 
    name: "Vtex", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/vtex.png?v=1739113267"
  },
  { 
    name: "Wix", 
    active: false,
    logo: ""
  },
  { 
    name: "Woocommerce", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/woocommerce.webp?v=1739113267"
  },
  { 
    name: "TiendaNube", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/tiendanube.svg?v=1739113267"
  },
  { 
    name: "Jumpseller", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/jumpseller.png?v=1739113267"
  },
  { 
    name: "Prestashop", 
    active: false,
    logo: "https://cdn.shopify.com/s/files/1/0603/2670/7396/files/prestashop.png?v=1739113267"
  },
];

export const PlatformsCarousel = () => {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Compatible con los checkout de:</h2>
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
              {platforms.map((platform, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <div className="flex flex-col items-center justify-center p-4">
                    <div
                      className={cn(
                        "flex items-center justify-center mb-2",
                        !platform.active && "grayscale opacity-50"
                      )}
                    >
                      {platform.logo ? (
                        <img 
                          src={platform.logo} 
                          alt={platform.name} 
                          className="w-32 h-20 object-contain"
                        />
                      ) : (
                        <span className={cn(
                          "text-lg font-semibold",
                          platform.active ? "text-primary" : "text-gray-500"
                        )}>
                          {platform.name}
                        </span>
                      )}
                    </div>
                    {!platform.active && (
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

