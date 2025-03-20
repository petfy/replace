
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircleIcon } from "lucide-react";

interface StoreTrackingScriptProps {
  storeId: string;
}

export const StoreTrackingScript = ({ storeId }: StoreTrackingScriptProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seguimiento de descuentos y analítica</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              El seguimiento de analítica está habilitado automáticamente para tu tienda. 
              No se requiere ninguna acción adicional.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              RePlace rastrea automáticamente las siguientes interacciones:
            </p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start">
                <span className="font-medium mr-1">•</span>
                <span>Vistas de tu tienda en el directorio de RePlace</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-1">•</span>
                <span>Clicks en el botón "Ver Tienda" de tu ficha en el directorio</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-1">•</span>
                <span>Uso de códigos de descuento mediante el botón "CANJEAR DESCUENTO"</span>
              </li>
            </ul>
            
            <div className="mt-4 text-sm text-blue-600">
              <p>Los datos de analítica se actualizan en tiempo real y puedes verlos en la sección "Analítica" de tu panel de control.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
