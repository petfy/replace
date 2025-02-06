
import { Progress } from "@/components/ui/progress";

interface FormProgressProps {
  value: number;
}

export const FormProgress = ({ value }: FormProgressProps) => {
  return (
    <div className="flex items-center gap-2">
      <Progress value={value} className="flex-grow" />
      <span className="text-sm text-gray-500">{value}%</span>
    </div>
  );
};
