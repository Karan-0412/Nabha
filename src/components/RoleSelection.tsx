import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCircle, Stethoscope } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: 'patient' | 'doctor') => void;
}

const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">TeleMed Platform</h1>
          <p className="text-muted-foreground">Choose your role to continue</p>
        </div>
        
        <div className="space-y-4">
          <Card className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20" 
                onClick={() => onRoleSelect('patient')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">I am a Patient</h3>
                <p className="text-sm text-muted-foreground">Request consultation and manage your health</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20" 
                onClick={() => onRoleSelect('doctor')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">I am a Doctor</h3>
                <p className="text-sm text-muted-foreground">View patients and provide consultations</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;