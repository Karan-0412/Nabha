import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User, Plus, Video, Phone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { useUserContext } from '@/context/user-role';
import { Appointment, createAppointment, getAppointmentsForRole, isDoctorAvailableAt, onDBUpdate, acceptAppointment } from '@/store/telemedStore';
import { ensureRoom } from '@/store/messageStore';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const doctors = [
  { id: 'd1', name: 'Dr. Johnson' },
  { id: 'd2', name: 'Dr. Smith' },
  { id: 'd3', name: 'Dr. Lee' },
];
const patients = [
  { id: 'p1', name: 'Jane Smith' },
  { id: 'p2', name: 'John Doe' },
  { id: 'p3', name: 'Sarah Johnson' },
];

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const { userRole } = useUserContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [openNew, setOpenNew] = useState(false);
  const [newDateTime, setNewDateTime] = useState<string>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 3);
    const off = now.getTimezoneOffset();
    return new Date(now.getTime() - off * 60000).toISOString().slice(0,16);
  });
  const [newDoctorId, setNewDoctorId] = useState<string>('d1');
  const [newPatientId, setNewPatientId] = useState<string>('p1');

  useEffect(() => {
    const load = () => setAppointments(getAppointmentsForRole(userRole ?? 'patient'));
    load();
    return onDBUpdate(load);
  }, [userRole]);

  const createNewAppointment = () => {
    const dt = new Date(newDateTime);
    const doctor = doctors.find(d => d.id === newDoctorId)!;
    const patient = patients.find(p => p.id === (userRole === 'patient' ? 'p1' : newPatientId))!;
    if (!isDoctorAvailableAt(newDoctorId, dt)) {
      alert(`${doctor.name} not available at the selected time`);
      return;
    }
    createAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      scheduledAt: dt.toISOString(),
      status: 'confirmed',
    });
    setOpenNew(false);
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('appointments')}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medical appointments and schedule new consultations
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              {userRole === 'doctor' && (
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={newPatientId} onValueChange={setNewPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Select value={newDoctorId} onValueChange={setNewDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => {
                      const dt = new Date(newDateTime);
                      const available = isDoctorAvailableAt(d.id, dt);
                      return (
                        <SelectItem key={d.id} value={d.id} disabled={!available}>
                          {d.name} {!available ? '— Not available' : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={newDateTime} onChange={(e) => setNewDateTime(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpenNew(false)}>Cancel</Button>
                <Button onClick={createNewAppointment}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            {selectedDate && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">
                  Appointments on {selectedDate.toDateString()}
                </h3>
                <div className="space-y-3">
                  {appointments
                    .filter(apt => new Date(apt.scheduledAt).toDateString() === selectedDate.toDateString())
                    .map(appointment => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getAppointmentIcon(appointment.type)}
                          <div>
                            <p className="font-medium">{appointment.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {appointment.durationMinutes ? ` - ${appointment.durationMinutes}min` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          {userRole === 'doctor' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => {
                                ensureRoom(`patient-${appointment.patientId}`, appointment.patientName, 'patient');
                                navigate(`/chat?room=patient-${appointment.patientId}`);
                              }}>
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              {appointment.status === 'pending' && (
                                <Button className="bg-primary hover:bg-primary-hover" size="sm" onClick={() => acceptAppointment(appointment.id)}>Accept</Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('upcomingAppointments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div key={appointment.id}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getAppointmentIcon(appointment.type)}
                        <span className="font-medium text-sm">
                          {appointment.patientName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        with {appointment.doctorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointment.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  {index < upcomingAppointments.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No upcoming appointments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Video Calls</p>
              </div>
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsPage;
