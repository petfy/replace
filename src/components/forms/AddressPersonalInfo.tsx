
import { Input } from "@/components/ui/input";

interface AddressPersonalInfoProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  identification: string;
  onIdentificationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
}

export const AddressPersonalInfo = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  identification,
  onIdentificationChange,
  email,
  setEmail,
  phone,
  setPhone
}: AddressPersonalInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nombre"
          required
        />

        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Apellido"
          required
        />
      </div>

      <Input
        type="text"
        value={identification}
        onChange={onIdentificationChange}
        placeholder="RUT"
      />

      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <Input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Teléfono"
      />
    </div>
  );
};
