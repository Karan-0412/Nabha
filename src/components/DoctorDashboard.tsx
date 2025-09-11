import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Video } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  waitTime: string;
  status: 'waiting' | 'active';
}

interface DoctorDashboardProps {
  onConnectPatient: (patientId: string) => void;
  onBack: () => void;
}

const DoctorDashboard = ({ onConnectPatient, onBack }: DoctorDashboardProps) => {
  // Mock patient data
  const waitingPatients: Patient[] = [
    {
      id: '1',
      name: 'Jane Smith',
      age: 28,
      sex: 'Female',
      waitTime: '5 min',
      status: 'waiting'
    },
    {
      id: '2', 
      name: 'John Doe',
      age: 45,
      sex: 'Male',
      waitTime: '12 min',
      status: 'waiting'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      age: 34,
      sex: 'Female', 
      waitTime: '8 min',
      status: 'waiting'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Welcome, Dr. Johnson</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            Switch Role
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Waiting Patients</h2>
              <p className="text-muted-foreground">{waitingPatients.length} patients waiting for appointments</p>
            </div>
            <Badge variant="secondary" className="bg-warning/10 text-warning">
              {waitingPatients.length} Waiting
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {waitingPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <CardDescription>{patient.age} years old, {patient.sex}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {patient.waitTime}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => onConnectPatient(patient.id)}
                    className="w-full bg-primary hover:bg-primary-hover"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {waitingPatients.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">No patients waiting</CardTitle>
                <CardDescription>
                  New patient appointment requests will appear here automatically
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;