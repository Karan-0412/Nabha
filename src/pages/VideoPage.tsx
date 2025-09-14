import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCallScreen from "@/components/VideoCallScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const VideoPage = () => {
  const navigate = useNavigate();

  const patients = [
    { id: "1", name: "Jane Smith", age: 28, sex: "Female", dateJoined: "4/22/2019", claimsShared: "Yes" },
    { id: "2", name: "John Doe", age: 45, sex: "Male", dateJoined: "6/10/2020", claimsShared: "No" },
    { id: "3", name: "Sarah Johnson", age: 34, sex: "Female", dateJoined: "1/15/2021", claimsShared: "Yes" }
  ];

  const doctors = [
    { id: "d1", name: "Dr. Johnson" },
    { id: "d2", name: "Dr. Smith" },
    { id: "d3", name: "Dr. Lee" }
  ];

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0].id);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0].id);
  const [scheduledTime, setScheduledTime] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const off = now.getTimezoneOffset();
    const local = new Date(now.getTime() - off * 60000).toISOString().slice(0, 16);
    setScheduledTime(local);
  }, []);

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId)!, [patients, selectedPatientId]);
  const selectedDoctor = useMemo(() => doctors.find(d => d.id === selectedDoctorId)!, [doctors, selectedDoctorId]);

  return (
    <div className="h-full w-full">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Schedule and start a video call</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Scheduled time</Label>
              <Input id="time" type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
            </div>
            <div className="md:col-span-3 flex justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Selected: {selectedPatient.name} • {selectedDoctor.name} • {scheduledTime.replace('T', ' ')}
              </div>
              <div className="space-x-2">
                <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
                <Button className="bg-primary hover:bg-primary-hover">Start Call</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <VideoCallScreen
        patientId={selectedPatientId}
        userRole="doctor"
        onEndCall={() => navigate("/")}
      />
    </div>
  );
};

export default VideoPage;
