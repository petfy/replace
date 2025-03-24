
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageSquare, Send, ArrowLeft } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke("send-contact-email", {
        body: data,
      });
      
      if (response.error) throw new Error(response.error.message);
      
      toast({
        title: "Mensaje enviado",
        description: "Hemos recibido tu mensaje y te responderemos pronto.",
      });
      
      reset();
    } catch (error: any) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Error",
        description: "No pudimos enviar tu mensaje. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="py-4 px-6 border-b bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <img src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/replace-logo.png" alt="Replace Logo" className="h-6 w-6 text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">RePlace</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-700 hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Volver
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Contáctanos</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            ¿Tienes alguna sugerencia, duda o problema? Completa el siguiente formulario y nos pondremos en contacto contigo lo antes posible.
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                {...register("name", { required: "El nombre es requerido" })}
                error={errors.name ? true : false}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register("email", { 
                  required: "El correo electrónico es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido"
                  } 
                })}
                error={errors.email ? true : false}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                placeholder="¿Sobre qué quieres contactarnos?"
                {...register("subject", { required: "El asunto es requerido" })}
                error={errors.subject ? true : false}
              />
              {errors.subject && <p className="text-sm text-red-500">{errors.subject.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                {...register("message", { required: "El mensaje es requerido" })}
                className={errors.message ? "border-red-500" : ""}
              />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de contacto</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Correo electrónico</p>
                  <p className="text-gray-600">jony@jonytips.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-50 py-12 mt-16 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://riclirqvaxqlvbhfsowh.supabase.co/storage/v1/object/public/logos/replace-logo.png" alt="Replace Logo" className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">RePlace</span>
              </div>
              <p className="text-gray-600">
                Gestiona todas tus direcciones de envío en una plataforma y ahorra tiempo en tus compras online.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p className="text-gray-600">Email: jony@jonytips.com</p>
              <p className="text-gray-600">Teléfono: +56 9 76614125</p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600">© 2024 RePlace. Todos los derechos reservados.</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
