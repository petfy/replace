import { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { categories } from "@/components/store/StoreCategories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Define the Store type to match the database structure
type Store = {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  category: string | null;
  keywords: string[] | null;
  platform: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  description: string | null;
};

// Derived type for UI display
type StoreWithTags = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  category: string | null;
  tags: string[];
};

const StoresPage = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreWithTags[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreWithTags[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar la recarga

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      console.log("Starting to fetch stores from Supabase in StoresPage.tsx...");
      console.log("Current environment:", import.meta.env.MODE);
      console.log("Supabase client initialized:", !!supabase);
      console.log("Refresh attempt:", refreshKey);
      
      // Important: Adding .select('*') explicitly to fetch all stores without RLS filtering
      const { data, error } = await supabase
        .from("stores")
        .select("*");
      
      console.log("Complete Supabase response:", { data, error });
      
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

      console.log("Fetched stores data:", data);
      
      if (!data || data.length === 0) {
        console.log("No stores found in the database in StoresPage.tsx");
        toast({
          title: "Información",
          description: "No hay tiendas registradas en la base de datos",
        });
        setStores([]);
        setFilteredStores([]);
        setLoading(false);
        return;
      }
      
      console.log(`Successfully fetched ${data.length} stores in StoresPage.tsx`);
      console.log("Store IDs:", data.map(store => store.id));
      
      // Transform data to match the StoreWithTags type
      const transformedStores: StoreWithTags[] = data.map((store: Store) => ({
        id: store.id,
        name: store.name,
        description: store.description || "Sin descripción disponible",
        logo_url: store.logo_url,
        website: store.website,
        category: store.category,
        tags: store.keywords || []
      }));

      console.log("Transformed stores:", transformedStores);
      
      setStores(transformedStores);
      setFilteredStores(transformedStores);

      // Extract unique categories from the stores
      const allCategories = data
        .map(store => store.category)
        .filter(Boolean) as string[];
        
      const uniqueCats = [...new Set(allCategories)];
      console.log("Extracted categories:", uniqueCats);
      
      setUniqueCategories(uniqueCats);
    } catch (err) {
      console.error("Exception while loading stores:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar las tiendas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [toast, refreshKey]);

  useEffect(() => {
    let filtered = stores;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        store =>
          store.name.toLowerCase().includes(query) ||
          (store.description && store.description.toLowerCase().includes(query)) ||
          (store.tags && store.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(store => store.category === selectedCategory);
    }

    setFilteredStores(filtered);
  }, [searchQuery, selectedCategory, stores]);

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.value === categoryName);
    const Icon = category?.icon;
    return Icon ? <Icon className="h-4 w-4 mr-1" /> : null;
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto py-4 px-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                <img
                  src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/replace-logo.png"
                  alt="Replace Logo"
                  className="h-6 w-6 text-primary mr-2"
                />
                <span>RePlace</span>
              </a>
            </div>
            <div>
              <a href="/auth">
                <Button>Iniciar sesión</Button>
              </a>
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tiendas Asociadas a RePlace</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre descuentos exclusivos y beneficios en nuestras tiendas aliadas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, categoría o interés..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
                title="Actualizar listado"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full text-sm"
                >
                  Todas
                </Button>
                
                {uniqueCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full text-sm flex items-center"
                  >
                    {getCategoryIcon(category)}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-3 w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                <div className="mt-4 flex justify-center">
                  <div className="h-10 bg-gray-200 rounded w-full max-w-[200px]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div key={store.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col transition-transform hover:scale-105">
                <div className="mb-4 flex justify-center">
                  <div className="w-24 h-24 overflow-hidden rounded-full border">
                    <AspectRatio ratio={1 / 1} className="bg-gray-100">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={`${store.name} logo`}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-500">{store.name.charAt(0)}</span>
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-center mb-2">{store.name}</h3>
                
                <p className="text-gray-600 text-sm mb-4 text-center flex-grow">
                  {store.description}
                </p>
                
                <div className="flex justify-center mb-4">
                  {store.category && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center">
                      {getCategoryIcon(store.category)}
                      {store.category}
                    </Badge>
                  )}
                </div>
                
                <div className="mt-auto">
                  <a
                    href={store.website || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button variant="default" className="w-full">
                      Visitar tienda
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tiendas</h3>
            <p className="text-gray-600 mb-4">
              No hay tiendas que coincidan con tu búsqueda. Intenta con otros términos.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar listado
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresPage;
