import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VideoCallScreen from "@/components/VideoCallScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const VideoPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'doctor'>("doctor");

  return (
    <div className="h-full w-full">
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Start a mock video call</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div>
              <Label className="mb-2 block">Role</Label>
              <RadioGroup
                value={role}
                onValueChange={(v) => setRole(v as 'patient' | 'doctor')}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="role-doctor" value="doctor" />
                  <Label htmlFor="role-doctor">Doctor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="role-patient" value="patient" />
                  <Label htmlFor="role-patient">Patient</Label>
                </div>
              </RadioGroup>
            </div>
            <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
          </CardContent>
        </Card>
      </div>
      <VideoCallScreen
        patientId="patient-1"
        userRole={role}
        onEndCall={() => navigate("/")}
      />
    </div>
  );
};

export default VideoPage;
