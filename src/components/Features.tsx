import { Home, Briefcase, Tag, Clock } from "lucide-react";

const features = [
  {
    icon: <Home className="w-6 h-6" />,
    title: "Múltiples direcciones",
    description: "Guarda todas tus direcciones de envío en un solo lugar",
  },
  {
    icon: <Tag className="w-6 h-6" />,
    title: "Etiquetas personalizadas",
    description: "Organiza tus direcciones con etiquetas como Casa, Trabajo, etc.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Ahorra tiempo",
    description: "Autocompletado instantáneo en tus tiendas favoritas",
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: "Descuentos exclusivos",
    description: "Accede a ofertas especiales al usar Replace",
  },
];

export const Features = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-primary-700">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};