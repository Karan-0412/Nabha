import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Calendar, FileText, MessageCircle } from "lucide-react";

interface PatientDashboardProps {
  onRequestConsultation: () => void;
  onBack: () => void;
}

const PatientDashboard = ({ onRequestConsultation, onBack }: PatientDashboardProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Patient Portal</h1>
            <p className="text-muted-foreground">Welcome back, Jane Smith</p>
          </div>
          <Button variant="outline" onClick={onBack}>
            Switch Role
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full md:col-span-2 lg:col-span-3">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Request a Consultation</CardTitle>
              <CardDescription>
                Connect with a healthcare professional for immediate medical assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={onRequestConsultation}
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3"
              >
                Start Consultation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Medical Records</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">3 documents available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Messages</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">2 unread messages</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;