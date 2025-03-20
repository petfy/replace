
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Store {
  id: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  website: string | null;
}

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("stores")
          .select("id, name, logo_url, category, website")
          .order("name");

        if (error) {
          throw error;
        }

        setStores(data || []);
      } catch (error: any) {
        console.error("Error fetching stores:", error.message);
        toast({
          title: "Error",
          description: "No se pudieron cargar las tiendas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Directorio de Tiendas
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Explora nuestras tiendas asociadas y aprovecha sus descuentos
            exclusivos
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stores.length > 0 ? (
            stores.map((store) => (
              <div
                key={store.id}
                className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={`${store.name} logo`}
                          className="h-12 w-12 rounded object-contain bg-gray-50"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                          <Star className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {store.name}
                        </h3>
                        {store.category && (
                          <p className="text-sm text-gray-500">
                            {store.category}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      <Link
                        to={`/discounts/${store.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Ver Descuentos Disponibles
                      </Link>
                    </div>
                    {store.website && (
                      <Button
                        asChild
                        size="sm"
                        className="bg-primary"
                      >
                        <a
                          href={store.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          Ver Tienda
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-gray-600">
                No hay tiendas disponibles en este momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoresPage;
