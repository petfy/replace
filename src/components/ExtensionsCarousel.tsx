
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const extensions = [{
  name: "Chrome",
  active: true,
  logo: "https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/chrome.svg",
  link: "https://chromewebstore.google.com/detail/plaafngekhmbngpcjjpflanpgcefbacl?utm_source=item-share-cb"
}, {
  name: "Firefox",
  active: false,
  logo: "https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/Firefox.png"
}, {
  name: "Safari",
  active: false,
  logo: "https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/safari.jpg"
}, {
  name: "App Store iOS",
  active: false,
  logo: "https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/ios.png"
}, {
  name: "Play Store Android",
  active: false,
  logo: "https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/android.png"
}];

export const ExtensionsCarousel = () => {
  const plugin = useRef(Autoplay({
    delay: 2000,
    stopOnInteraction: false
  }));
  
  return <div className="bg-white py-[17px]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center mb-8">Extensiones disponibles:</h2>
        <div className="mx-auto max-w-5xl">
          <Carousel opts={{
          align: "center",
          loop: true,
          dragFree: true,
          containScroll: "trimSnaps"
        }} plugins={[plugin.current]} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {extensions.map((extension, index) => <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <div className="flex flex-col items-center justify-center p-4">
                    {extension.link ? (
                      <a 
                        href={extension.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "flex flex-col items-center justify-center mb-2",
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
                      </a>
                    ) : (
                      <div className={cn("flex items-center justify-center mb-2", !extension.active && "grayscale opacity-50")}>
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
                    )}
                    {!extension.active && <span className="text-sm text-gray-500">¡Muy Pronto!</span>}
                  </div>
                </CarouselItem>)}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>;
};
