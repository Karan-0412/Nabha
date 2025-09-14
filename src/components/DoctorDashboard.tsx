import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Video, Plus, Trash2, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  addDoctorAvailabilityWindow,
  getAppointmentsForRole,
  getDoctorAvailabilityWindows,
  onDBUpdate,
  updateDoctorAvailabilityWindow,
  removeDoctorAvailabilityWindow,
  acceptAppointment,
  rejectAppointment,
  Appointment,
} from "@/store/telemedStore";

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
    { id: '1', name: 'Jane Smith', age: 28, sex: 'Female', waitTime: '5 min', status: 'waiting' },
    { id: '2', name: 'John Doe', age: 45, sex: 'Male', waitTime: '12 min', status: 'waiting' },
    { id: '3', name: 'Sarah Johnson', age: 34, sex: 'Female', waitTime: '8 min', status: 'waiting' },
  ];

  const [availability, setAvailability] = useState(() => getDoctorAvailabilityWindows('d1'));
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const load = () => {
      setAvailability(getDoctorAvailabilityWindows('d1'));
      setAppointments(getAppointmentsForRole('doctor'));
    };
    load();
    return onDBUpdate(load);
  }, []);

  const upcoming = useMemo(() => appointments.filter(a => new Date(a.scheduledAt) >= new Date()), [appointments]);

  const handleAddWindow = () => {
    const last = availability[availability.length - 1] || { startHour: 9, endHour: 12 };
    const start = Math.min(23, Math.max(0, last.endHour));
    const end = Math.min(24, start + 4);
    addDoctorAvailabilityWindow('d1', start, end);
  };

  const handleChange = (index: number, field: 'startHour' | 'endHour', value: number) => {
    const current = availability[index];
    const start = field === 'startHour' ? value : current.startHour;
    const end = field === 'endHour' ? value : current.endHour;
    updateDoctorAvailabilityWindow('d1', index, Number(start), Number(end));
  };

  const handleRemove = (index: number) => {
    removeDoctorAvailabilityWindow('d1', index);
  };

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectAptId, setRejectAptId] = useState<string | null>(null);

  const openReject = (aptId: string) => {
    setRejectAptId(aptId);
    setRejectReason('');
    setRejectOpen(true);
  };

  const confirmReject = () => {
    if (!rejectAptId) return;
    rejectAppointment(rejectAptId, rejectReason || undefined);
    setRejectOpen(false);
    setRejectAptId(null);
    setRejectReason('');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">Welcome, Dr. Johnson</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Set Availability</CardTitle>
            <CardDescription>Configure working hours with breaks by adding multiple time windows.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {availability.map((w, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2 md:col-span-2">
                  <Label>Start Hour</Label>
                  <Input type="number" min={0} max={23} value={w.startHour} onChange={(e) => handleChange(idx, 'startHour', Number(e.target.value))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>End Hour</Label>
                  <Input type="number" min={1} max={24} value={w.endHour} onChange={(e) => handleChange(idx, 'endHour', Number(e.target.value))} />
                </div>
                <div className="flex md:justify-end">
                  <Button variant="destructive" onClick={() => handleRemove(idx)} disabled={availability.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <div className="text-xs text-muted-foreground">Hours are in 24-hour format.</div>
              <Button variant="secondary" onClick={handleAddWindow}>
                <Plus className="h-4 w-4" /> Add Window
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Appointments</CardTitle>
            <CardDescription>All appointments scheduled to you</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {upcoming.length === 0 && (
              <div className="text-sm text-muted-foreground">No upcoming appointments</div>
            )}
            {upcoming.map(apt => (
              <div key={apt.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{apt.patientName}</div>
                  <div className="text-sm text-muted-foreground">{new Date(apt.scheduledAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    import("@/store/messageStore").then(({ ensureRoom }) => {
                      ensureRoom(`patient-${apt.patientId}`, apt.patientName, 'patient');
                      window.location.href = `/chat?room=${encodeURIComponent(`patient-${apt.patientId}`)}`;
                    });
                  }}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  {apt.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <Button className="bg-primary hover:bg-primary-hover" size="sm" onClick={() => acceptAppointment(apt.id)}>Accept</Button>
                      <Button variant="destructive" size="sm" onClick={() => openReject(apt.id)}>Reject</Button>
                    </div>
                  ) : (
                    <Badge variant="secondary">{apt.status}</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
      </main>
    </div>
  );
};

export default DoctorDashboard;
