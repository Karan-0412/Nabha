import { useTranslation } from 'react-i18next';
import { Heart, User, Stethoscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from './LanguageSelector';

interface RoleSelectionProps {
  onRoleSelect: (role: 'patient' | 'doctor') => void;
}

const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-red-500 mr-3" />
            <h1 className="text-4xl font-bold text-foreground">TeleMed</h1>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">{t('selectRole')}</h2>
          <p className="text-muted-foreground">Choose how you'd like to use our telemedicine platform</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Patient Card */}
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <User className="h-16 w-16 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">{t('patient')}</CardTitle>
              <CardDescription className="text-lg">
                {t('patientDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => onRoleSelect('patient')}
                className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700"
              >
                Continue as {t('patient')}
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Stethoscope className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{t('doctor')}</CardTitle>
              <CardDescription className="text-lg">
                {t('doctorDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => onRoleSelect('doctor')}
                className="w-full text-lg py-6 bg-green-600 hover:bg-green-700"
              >
                Continue as {t('doctor')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Secure • HIPAA Compliant • Available 24/7
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;