import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCallScreen from "@/components/VideoCallScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUserContext } from "@/context/user-role";
import {
  acceptCall,
  createAppointment,
  createRingingCall,
  endCall,
  getActiveOrRingingCallForPatient,
  getCallHistoryForRole,
  getUpcomingAppointmentsForRole,
  onDBUpdate,
  startCallNow,
  startIncomingCallSimulation,
  stopIncomingCallSimulation,
} from "@/store/telemedStore";

const patients = [
  { id: "p1", name: "Jane Smith", age: 28, sex: "Female", dateJoined: "4/22/2019", claimsShared: "Yes" },
  { id: "p2", name: "John Doe", age: 45, sex: "Male", dateJoined: "6/10/2020", claimsShared: "No" },
  { id: "p3", name: "Sarah Johnson", age: 34, sex: "Female", dateJoined: "1/15/2021", claimsShared: "Yes" }
];

const doctors = [
  { id: "d1", name: "Dr. Johnson" },
  { id: "d2", name: "Dr. Smith" },
  { id: "d3", name: "Dr. Lee" }
];

const VideoPage = () => {
  const navigate = useNavigate();
  const { userRole } = useUserContext();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0].id);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0].id);
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const off = now.getTimezoneOffset();
    const local = new Date(now.getTime() - off * 60000).toISOString().slice(0, 16);
    setScheduledTime(local);
  }, []);

  useEffect(() => {
    const unsub = onDBUpdate(() => setTick(t => t + 1));
    if (userRole === 'patient') startIncomingCallSimulation('p1');
    return () => {
      unsub();
      stopIncomingCallSimulation();
    };
  }, [userRole]);

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId)!, [selectedPatientId]);
  const selectedDoctor = useMemo(() => doctors.find(d => d.id === selectedDoctorId)!, [selectedDoctorId]);

  const incoming = userRole === 'patient' ? getActiveOrRingingCallForPatient('p1') : undefined;
  const upcoming = getUpcomingAppointmentsForRole(userRole ?? 'patient');
  const history = getCallHistoryForRole(userRole ?? 'patient');

  const handleStartDoctorCall = () => {
    const apt = createAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      scheduledAt: new Date(scheduledTime).toISOString(),
    });
    const call = startCallNow({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      appointmentId: apt.id,
    });
    setActiveCallId(call.id);
  };

  const handlePatientJoin = (appointmentId?: string) => {
    const call = startCallNow({
      patientId: 'p1',
      patientName: 'Jane Smith',
      doctorId: 'd1',
      doctorName: 'Dr. Johnson',
      appointmentId,
    });
    setActiveCallId(call.id);
  };

  const handleAcceptIncoming = () => {
    if (incoming) {
      const call = acceptCall(incoming.id);
      setActiveCallId(call?.id ?? null);
    }
  };

  const handleDeclineIncoming = () => {
    if (incoming) {
      endCall(incoming.id);
    }
  };

  const handleEnd = () => {
    if (activeCallId) endCall(activeCallId);
    setActiveCallId(null);
    navigate('/dashboard');
  };

  return (
    <div className="h-full w-full space-y-4 p-4">
      {userRole === 'doctor' && !activeCallId && (
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
                <Button className="bg-primary hover:bg-primary-hover" onClick={handleStartDoctorCall}>Start Call</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'patient' && !activeCallId && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Incoming Call</CardTitle>
            </CardHeader>
            <CardContent>
              {incoming && incoming.status === 'ringing' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{incoming.doctorName} is calling…</div>
                    <div className="text-sm text-muted-foreground">Tap to accept or decline</div>
                  </div>
                  <div className="space-x-2">
                    <Button variant="destructive" onClick={handleDeclineIncoming}>Decline</Button>
                    <Button className="bg-primary hover:bg-primary-hover" onClick={handleAcceptIncoming}>Accept</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No incoming call. A mock call may arrive at any time.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={() => createRingingCall({ patientId: 'p1', patientName: 'Jane Smith', doctorId: 'd1', doctorName: 'Dr. Johnson' })}>Simulate Incoming Call</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!activeCallId && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcoming.length === 0 && <div className="text-sm text-muted-foreground">No upcoming video appointments</div>}
              {upcoming.map(apt => {
                const canJoin = new Date(apt.scheduledAt).getTime() - Date.now() < 5 * 60 * 1000;
                return (
                  <div key={apt.id} className="flex items-center justify-between border rounded p-2">
                    <div>
                      <div className="font-medium">{apt.patientName} • {apt.doctorName}</div>
                      <div className="text-sm text-muted-foreground">{new Date(apt.scheduledAt).toLocaleString()}</div>
                    </div>
                    {userRole === 'patient' && (
                      <Button disabled={!canJoin} onClick={() => handlePatientJoin(apt.id)}>Join</Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 && <div className="text-sm text-muted-foreground">No past calls</div>}
              {history.map(call => (
                <div key={call.id} className="flex items-center justify-between border rounded p-2">
                  <div>
                    <div className="font-medium">{call.patientName} • {call.doctorName}</div>
                    <div className="text-sm text-muted-foreground">Ended {call.endedAt ? new Date(call.endedAt).toLocaleString() : ''}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeCallId && (
        <VideoCallScreen
          patientId={userRole === 'doctor' ? selectedPatientId : 'p1'}
          userRole={userRole === 'doctor' ? 'doctor' : 'patient'}
          onEndCall={handleEnd}
        />
      )}
    </div>
  );
};

export default VideoPage;
