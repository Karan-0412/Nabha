import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Video,
  Phone,
  Search,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  department: string;
  doctorName: string;
  date: Date;
  time: string;
  type: "video" | "phone" | "in-person";
  status: "confirmed" | "pending" | "cancelled";
  duration: number;
  message?: string;
}

const initialAppointments: Appointment[] = [
  {
    id: "1",
    patientName: "John Smith",
    patientEmail: "john@example.com",
    patientPhone: "+1 (555) 123-4567",
    department: "Cardiology",
    doctorName: "Dr. Sarah Wilson",
    date: new Date(),
    time: "10:00 AM",
    type: "video",
    status: "confirmed",
    duration: 30,
    message: "Follow-up appointment.",
  },
  {
    id: "2",
    patientName: "Emily Johnson",
    patientEmail: "emily@example.com",
    patientPhone: "+1 (555) 987-6543",
    department: "Dermatology",
    doctorName: "Dr. Michael Brown",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    time: "2:30 PM",
    type: "video",
    status: "pending",
    duration: 45,
    message: "New patient consultation.",
  },
  {
    id: "3",
    patientName: "Robert Davis",
    patientEmail: "robert@example.com",
    patientPhone: "+1 (555) 555-1234",
    department: "Neurology",
    doctorName: "Dr. Lisa Anderson",
    date: new Date(Date.now() + 48 * 60 * 60 * 1000),
    time: "11:15 AM",
    type: "phone",
    status: "confirmed",
    duration: 20,
    message: "Medication review.",
  },
];

const departments = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
];

const doctors = [
  {
    name: "Dr. Sarah Wilson",
    department: "Cardiology",
    timings: ["10:00 AM", "11:00 AM", "02:00 PM"],
  },
  {
    name: "Dr. Michael Brown",
    department: "Dermatology",
    timings: ["09:30 AM", "11:30 AM", "03:00 PM"],
  },
  {
    name: "Dr. Lisa Anderson",
    department: "Neurology",
    timings: ["08:00 AM", "01:00 PM", "04:00 PM"],
  },
  {
    name: "Dr. David Rodriguez",
    department: "Orthopedics",
    timings: ["09:00 AM", "10:30 AM", "02:30 PM"],
  },
  {
    name: "Dr. Jessica Chen",
    department: "Pediatrics",
    timings: ["1:00 PM", "2:00 PM", "4:00 PM"],
  },
];

const AppointmentsPage = () => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  // Form state for dropdowns
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<typeof doctors>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [availableTimings, setAvailableTimings] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] =
    useState<Appointment["type"]>("video");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    new Date()
  );
  const [appointmentMessage, setAppointmentMessage] = useState("");

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const handleOpenModal = (appointment: Appointment | null = null) => {
    setEditingAppointment(appointment);
    if (appointment) {
      setPatientName(appointment.patientName);
      setPatientEmail(appointment.patientEmail);
      setPatientPhone(appointment.patientPhone);
      setAppointmentDate(appointment.date);
      setAppointmentType(appointment.type);
      setSelectedDepartment(appointment.department);
      setFilteredDoctors(
        doctors.filter((d) => d.department === appointment.department)
      );
      setSelectedDoctor(appointment.doctorName);
      const doctor = doctors.find((d) => d.name === appointment.doctorName);
      setAvailableTimings(doctor?.timings || []);
      setSelectedTime(appointment.time);
      setAppointmentMessage(appointment.message || "");
    } else {
      setPatientName("");
      setPatientEmail("");
      setPatientPhone("");
      setAppointmentDate(new Date());
      setAppointmentType("video");
      setSelectedDepartment("");
      setFilteredDoctors([]);
      setSelectedDoctor("");
      setAvailableTimings([]);
      setSelectedTime("");
      setAppointmentMessage("");
    }
    setIsModalOpen(true);
  };

  const handleDepartmentSelect = (departmentName: string) => {
    setSelectedDepartment(departmentName);
    const filtered = doctors.filter((d) => d.department === departmentName);
    setFilteredDoctors(filtered);
    setSelectedDoctor("");
    setAvailableTimings([]);
    setSelectedTime("");
  };

  const handleDoctorSelect = (doctorName: string) => {
    setSelectedDoctor(doctorName);
    const doctor = doctors.find((d) => d.name === doctorName);
    setAvailableTimings(doctor?.timings || []);
    setSelectedTime(doctor?.timings[0] || "");
  };

  const filteredAppointments = appointments.filter(
    (apt) =>
      (apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || apt.status === statusFilter)
  );

  const upcomingAppointments = filteredAppointments
    .filter((apt) => apt.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: Appointment = {
      id: editingAppointment ? editingAppointment.id : String(Date.now()),
      patientName: patientName,
      patientEmail: patientEmail,
      patientPhone: patientPhone,
      department: selectedDepartment,
      doctorName: selectedDoctor,
      date: appointmentDate || new Date(),
      time: selectedTime,
      duration: 30, // Default duration, can be made dynamic
      type: appointmentType,
      status: editingAppointment ? editingAppointment.status : "pending",
      message: appointmentMessage,
    };

    if (editingAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === editingAppointment.id ? newAppointment : apt
        )
      );
    } else {
      setAppointments((prev) => [...prev, newAppointment]);
    }
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDelete = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  const getAppointmentStatusForDate = (date: Date) => {
    const dayAppointments = appointments.filter(
      (apt) => apt.date.toDateString() === date.toDateString()
    );
    if (dayAppointments.some((apt) => apt.status === "pending")) {
      return "pending";
    }
    if (dayAppointments.some((apt) => apt.status === "confirmed")) {
      return "confirmed";
    }
    return null;
  };

  const dayStatusClasses = {
    pending: "bg-yellow-500",
    confirmed: "bg-green-500",
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medical appointments and schedule new consultations
          </p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col md:flex-row items-stretch gap-3">
        <div className="flex-grow flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex justify-center flex-shrink-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  components={{
                    Day: ({ date }) => {
                      const status = getAppointmentStatusForDate(date);
                      const isSelected =
                        selectedDate &&
                        date.toDateString() === selectedDate.toDateString();
                      return (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            className={`h-9 w-9 p-0 font-normal rounded-full ${
                              isSelected ? "bg-blue-500 text-white" : ""
                            }`}
                            onClick={() => setSelectedDate(date)}
                          >
                            {date.getDate()}
                          </Button>
                          {status && (
                            <div
                              className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${dayStatusClasses[status]}`}
                            />
                          )}
                        </div>
                      );
                    },
                  }}
                />
              </div>
              {selectedDate && (
                <div className="flex-grow">
                  <h3 className="font-semibold mb-3">
                    Appointments on {selectedDate.toDateString()}
                  </h3>
                  <div className="space-y-3">
                    <TooltipProvider>
                      {filteredAppointments
                        .filter(
                          (apt) =>
                            apt.date.toDateString() ===
                            selectedDate.toDateString()
                        )
                        .map((appointment) => (
                          <Tooltip key={appointment.id}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition">
                                <div className="flex items-center gap-3">
                                  {getAppointmentIcon(appointment.type)}
                                  <div>
                                    <p className="font-medium">
                                      {appointment.patientName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.time} • {appointment.duration}{" "}
                                      min
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getStatusColor(appointment.status)}>
                                    {appointment.status}
                                  </Badge>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                      handleOpenModal(appointment);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(appointment.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs max-h-40 overflow-y-auto p-4">
                              <p>{appointment.message}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                    </TooltipProvider>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Upcoming Appointments
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
                        {appointment.date.toLocaleDateString()} at{" "}
                        {appointment.time}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(
                        appointment.status
                      )}`}
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

      <Separator className="my-6" />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? "Edit Appointment" : "Request Appointment"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Name *</Label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Patient Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Phone *</Label>
                <Input
                  id="patientPhone"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Phone"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email *</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date *</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={appointmentDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) =>
                    setAppointmentDate(new Date(e.target.value))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departments *</Label>
                <Select
                  name="department"
                  value={selectedDepartment}
                  onValueChange={handleDepartmentSelect}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctors *</Label>
                <Select
                  name="doctorName"
                  value={selectedDoctor}
                  onValueChange={handleDoctorSelect}
                  disabled={!selectedDepartment}
                >
                  <SelectTrigger id="doctorName">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doctor) => (
                        <SelectItem key={doctor.name} value={doctor.name}>
                          {doctor.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="placeholder" disabled>
                        Select a department first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={appointmentMessage}
                  onChange={(e) => setAppointmentMessage(e.target.value)}
                  placeholder="Message"
                  required
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingAppointment ? "Update" : "Submit Now"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;