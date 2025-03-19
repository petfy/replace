
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Store, Tag, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/components/store/StoreCategories";

interface StoreData {
  id: string;
  name: string;
  email: string | null;
  category: string | null;
  keywords: string[] | null;
  website: string | null;
  platform: string | null;
  logo_url: string | null;
}

const Stores = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [visibleStores, setVisibleStores] = useState(8);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch stores from Supabase in Stores.tsx...");
        
        // Debug: Log Supabase connection
        console.log("Supabase client initialized:", !!supabase);
        
        const { data, error } = await supabase
          .from("stores")
          .select("*");
          
        console.log("Raw Supabase response in Stores.tsx:", { data, error });

        if (error) {
          console.error("Error fetching stores:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar las tiendas: " + error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        if (!data || data.length === 0) {
          console.log("No stores found in the database in Stores.tsx");
          // Insert a sample store for testing if in development
          if (import.meta.env.DEV) {
            console.log("Development mode: Adding sample store for testing");
            const sampleStore: StoreData = {
              id: "sample-id",
              name: "Tienda de Prueba",
              email: "test@example.com",
              category: "moda",
              keywords: ["ropa", "accesorios", "moda"],
              website: "https://example.com",
              platform: "shopify",
              logo_url: "https://via.placeholder.com/150"
            };
            
            setStores([sampleStore]);
            setFilteredStores([sampleStore]);
            setUniqueCategories(["moda"]);
          } else {
            setStores([]);
            setFilteredStores([]);
          }
          setLoading(false);
          return;
        }
        
        console.log(`Successfully fetched ${data.length} stores in Stores.tsx`);
        
        const storesWithData = data.filter(
          (store) => store.name && (store.category || store.keywords)
        );
        
        console.log(`Filtered to ${storesWithData.length} valid stores`);
        
        setStores(storesWithData);
        setFilteredStores(storesWithData);

        // Extract unique categories
        const categories = storesWithData
          .map((store) => store.category)
          .filter((category): category is string => Boolean(category));
          
        console.log("Extracted categories:", categories);
        
        setUniqueCategories([...new Set(categories)]);
        setLoading(false);
      } catch (error: any) {
        console.error("Exception while loading stores:", error.message);
        toast({
          title: "Error",
          description: "No se pudieron cargar las tiendas",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchStores();
  }, [toast]);

  useEffect(() => {
    let result = stores;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(term) ||
          store.category?.toLowerCase().includes(term) ||
          store.keywords?.some((keyword) => 
            keyword.toLowerCase().includes(term)
          )
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(
        (store) => store.category === selectedCategory
      );
    }

    setFilteredStores(result);
  }, [searchTerm, selectedCategory, stores]);

  const loadMoreStores = () => {
    setVisibleStores((prev) => prev + 8);
  };

  const getCategoryIcon = (category: string) => {
    const foundCategory = categories.find(
      (cat) => cat.value.toLowerCase() === category.toLowerCase()
    );
    return foundCategory?.icon || Store;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando tiendas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/replace-logo.png"
                  alt="Replace Logo"
                  className="h-6 w-6 text-primary mr-2"
                />
                <span className="text-2xl font-bold text-primary">RePlace</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => window.location.href = "/"} variant="ghost">
                Inicio
              </Button>
              <Button onClick={() => window.location.href = "/dashboard"} variant="ghost">
                Mis Direcciones
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tiendas asociadas a RePlace
            </h1>
            <p className="text-lg text-gray-600">
              Descubre descuentos exclusivos en nuestras tiendas aliadas
            </p>
          </div>

          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, categoría o interés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm"
                >
                  Todas
                </Button>
                {uniqueCategories.map((category) => {
                  const CategoryIcon = getCategoryIcon(category);
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      className="text-sm"
                    >
                      <CategoryIcon className="h-4 w-4 mr-2" />
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredStores.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No se encontraron tiendas
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Intenta con otra búsqueda o categoría.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredStores.slice(0, visibleStores).map((store) => {
                  const CategoryIcon = getCategoryIcon(store.category);
                  return (
                    <div
                      key={store.id}
                      className="bg-white rounded-lg shadow overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 flex flex-col animate-fadeIn"
                    >
                      <div className="h-40 bg-gray-100 flex items-center justify-center p-4">
                        {store.logo_url ? (
                          <img
                            src={store.logo_url}
                            alt={`${store.name} logo`}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <Store className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <div className="p-4 flex-grow">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {store.category}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {store.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {store.keywords?.slice(0, 3).map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 border-t">
                        <a
                          href={store.website || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700 focus:outline-none"
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Ver descuentos
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {visibleStores < filteredStores.length && (
                <div className="mt-8 text-center">
                  <Button onClick={loadMoreStores} variant="outline" className="px-8">
                    Cargar más
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Stores;
