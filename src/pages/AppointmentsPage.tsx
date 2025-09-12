import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, User, Plus, Video, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: Date;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'confirmed' | 'pending' | 'cancelled';
  duration: number;
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'John Smith',
    doctorName: 'Dr. Sarah Wilson',
    date: new Date(),
    time: '10:00 AM',
    type: 'video',
    status: 'confirmed',
    duration: 30
  },
  {
    id: '2',
    patientName: 'Emily Johnson',
    doctorName: 'Dr. Michael Brown',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: '2:30 PM',
    type: 'video',
    status: 'pending',
    duration: 45
  },
  {
    id: '3',
    patientName: 'Robert Davis',
    doctorName: 'Dr. Lisa Anderson',
    date: new Date(Date.now() + 48 * 60 * 60 * 1000),
    time: '11:15 AM',
    type: 'phone',
    status: 'confirmed',
    duration: 20
  }
];

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

  const upcomingAppointments = mockAppointments
    .filter(apt => apt.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('appointments')}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medical appointments and schedule new consultations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
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
                  {mockAppointments
                    .filter(apt => 
                      apt.date.toDateString() === selectedDate.toDateString()
                    )
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
                              {appointment.time} - {appointment.duration}min
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
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
                        {appointment.date.toLocaleDateString()} at {appointment.time}
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

      {/* Quick Stats */}
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