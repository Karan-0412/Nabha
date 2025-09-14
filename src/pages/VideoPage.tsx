import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoCallScreen from "@/components/VideoCallScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/user-role";
import {
  acceptCall,
  createRingingCall,
  endCall,
  getActiveOrRingingCallForPatient,
  getCallHistoryForRole,
  getUpcomingAppointmentsForRole,
  onDBUpdate,
  startCallNow,
  startIncomingCallSimulation,
  stopIncomingCallSimulation,
  Appointment,
} from "@/store/telemedStore";

const VideoPage = () => {
  const navigate = useNavigate();
  const { userRole } = useUserContext();

  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [activeCallPatientId, setActiveCallPatientId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = onDBUpdate(() => setTick(t => t + 1));
    if (userRole === 'patient') startIncomingCallSimulation('p1');
    return () => {
      unsub();
      stopIncomingCallSimulation();
    };
  }, [userRole]);

  const incoming = userRole === 'patient' ? getActiveOrRingingCallForPatient('p1') : undefined;
  const upcoming = getUpcomingAppointmentsForRole(userRole ?? 'patient');
  const history = getCallHistoryForRole(userRole ?? 'patient');

  const handleDoctorStartFromAppointment = (apt: Appointment) => {
    const call = startCallNow({
      patientId: apt.patientId,
      patientName: apt.patientName,
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      appointmentId: apt.id,
    });
    setActiveCallId(call.id);
    setActiveCallPatientId(apt.patientId);
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
    setActiveCallPatientId(null);
    navigate('/dashboard');
  };

  return (
    <div className="h-full w-full space-y-4 p-4">
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
                    {userRole === 'doctor' && (
                      <Button disabled={!canJoin} onClick={() => handleDoctorStartFromAppointment(apt)}>Start</Button>
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
          patientId={userRole === 'doctor' ? (activeCallPatientId || '') : 'p1'}
          userRole={userRole === 'doctor' ? 'doctor' : 'patient'}
          onEndCall={handleEnd}
        />
      )}
    </div>
  );
};

export default VideoPage;
