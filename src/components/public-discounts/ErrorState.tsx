
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <img 
        src="/lovable-uploads/8135bb2c-9d94-4a47-8471-88383f309453.png"
        alt="RePlace Logo"
        className="h-16 mb-8"
      />
      <p className="text-lg text-red-600">{error}</p>
      <Button variant="outline" className="mt-4" onClick={goToDashboard}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al dashboard
      </Button>
    </div>
  );
};
