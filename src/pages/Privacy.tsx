
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="py-4 px-6 border-b">
        <div className="container mx-auto flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold text-primary">Política de Privacidad</span>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-blue max-w-none">
          <h1 className="text-3xl font-bold mb-8">Política de Privacidad de RePlace</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
            <p className="mb-4">
              Recopilamos información que usted nos proporciona directamente cuando utiliza nuestros servicios:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Información de contacto (nombre, correo electrónico)</li>
              <li>Direcciones de envío</li>
              <li>Información de la cuenta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
            <p className="mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Mejorar y personalizar su experiencia</li>
              <li>Comunicarnos con usted</li>
              <li>Procesar sus solicitudes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Protección de Datos</h2>
            <p className="mb-4">
              Implementamos medidas de seguridad diseñadas para proteger sus datos personales, incluyendo:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encriptación de datos sensibles</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de sistemas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Sus Derechos</h2>
            <p className="mb-4">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Acceder a sus datos personales</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Retirar su consentimiento</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Contacto</h2>
            <p className="mb-4">
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:
            </p>
            <ul className="list-none mb-4">
              <li>Email: jony@jonytips.com</li>
              <li>Teléfono: +56 9 76614125</li>
            </ul>
          </section>

          <footer className="text-sm text-gray-600 mt-8">
            Última actualización: {new Date().toLocaleDateString()}
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
