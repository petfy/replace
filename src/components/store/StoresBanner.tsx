
import { useNavigate } from "react-router-dom";
import { Store, Tag, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StoresBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 rounded-lg shadow-lg p-6 mb-6 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Store className="h-10 w-10 mr-4" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Tiendas asociadas a RePlace</h2>
            <p className="text-sm md:text-base opacity-90">Descubre descuentos exclusivos en nuestras tiendas aliadas</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate("/stores")} 
          className="bg-white text-purple-700 hover:bg-gray-100"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Ver tiendas
        </Button>
      </div>
    </div>
  );
};
