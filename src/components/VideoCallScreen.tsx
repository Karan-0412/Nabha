import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  User, 
  FileText,
  Clock,
  Package,
  MessageSquare,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface VideoCallScreenProps {
  patientId: string;
  userRole: 'patient' | 'doctor';
  onEndCall: () => void;
}

const VideoCallScreen = ({ patientId, userRole, onEndCall }: VideoCallScreenProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Mock patient data by id
  const patientsMap: Record<string, { name: string; age: number; sex: string; dateJoined: string; claimsShared: string } > = {
    "1": { name: "Jane Smith", age: 28, sex: "Female", dateJoined: "4/22/2019", claimsShared: "Yes" },
    "2": { name: "John Doe", age: 45, sex: "Male", dateJoined: "6/10/2020", claimsShared: "No" },
    "3": { name: "Sarah Johnson", age: 34, sex: "Female", dateJoined: "1/15/2021", claimsShared: "Yes" },
  };
  const patientData = patientsMap[patientId] ?? { name: "Unknown", age: 0, sex: "N/A", dateJoined: "N/A", claimsShared: "N/A" };

  const rxSteps = [
    { label: "Intake Reviewed", status: "completed" },
    { label: "Initial Message Sent", status: "completed" },
    { label: "Rx Created", status: "in-progress" },
    { label: "Check in with patient", status: "pending" }
  ];

  const orderHistory = [
    { id: "#335094", date: "4/22/2019" },
    { id: "#335344", date: "3/22/2019" },
    { id: "#335460", date: "2/22/2019" }
  ];

  const messages = [
    { sender: "doctor", text: "How are you feeling your spray?", time: "10:30" },
    { sender: "patient", text: "It's great!", time: "10:32" },
    { sender: "doctor", text: "Great, please continue using as directed.", time: "10:33" }
  ];

  useEffect(() => {
    // Simulate getting user media for the local video
    if (localVideoRef.current && !isVideoOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.log("Error accessing camera:", err));
    }
  }, [isVideoOff]);

  const sendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message
      setMessage("");
    }
  };

  return (
    <div className="h-screen bg-video-bg flex flex-col lg:flex-row overflow-hidden">
      {/* Patient Information Sidebar - Collapsible on mobile */}
      <div className="w-full lg:w-80 bg-medical-sidebar border-b lg:border-b-0 lg:border-r flex flex-col max-h-80 lg:max-h-none lg:h-full">
        <div className="p-4 lg:hidden">
          <h2 className="font-medium text-sm">Patient Info</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Patient Information */}
          <Card className="m-2 lg:m-4 mb-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 lg:space-y-3">
              <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2 lg:gap-3">
                <div className="lg:flex lg:justify-between">
                  <span className="text-xs lg:text-sm text-muted-foreground">Patient Name:</span>
                  <span className="text-xs lg:text-sm font-medium">{patientData.name}</span>
                </div>
                <div className="lg:flex lg:justify-between">
                  <span className="text-xs lg:text-sm text-muted-foreground">Age:</span>
                  <span className="text-xs lg:text-sm font-medium">{patientData.age}</span>
                </div>
                <div className="lg:flex lg:justify-between">
                  <span className="text-xs lg:text-sm text-muted-foreground">Sex:</span>
                  <span className="text-xs lg:text-sm font-medium">{patientData.sex}</span>
                </div>
                <div className="lg:flex lg:justify-between">
                  <span className="text-xs lg:text-sm text-muted-foreground">Date Joined:</span>
                  <span className="text-xs lg:text-sm font-medium">{patientData.dateJoined}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 lg:mt-3">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                View Intake
              </Button>
            </CardContent>
          </Card>

          {/* Rx Status - Hidden on mobile for space */}
          <Card className="hidden lg:block mx-4 mb-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rx Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rxSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    step.status === 'completed' ? 'bg-success' :
                    step.status === 'in-progress' ? 'bg-primary' : 'bg-muted'
                  }`} />
                  <span className={`text-sm ${
                    step.status === 'completed' ? 'text-foreground' :
                    step.status === 'in-progress' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-3 bg-primary text-primary-foreground">
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Messages - Compact on mobile */}
          <Card className="m-2 lg:mx-4 flex-1 flex flex-col min-h-[160px] lg:min-h-[200px]">
            <CardHeader className="pb-2 lg:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Chat</CardTitle>
                <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                  Templates
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-1 lg:space-y-2 mb-2 lg:mb-3 overflow-y-auto min-h-[80px] lg:min-h-[120px]">
                {messages.map((msg, index) => (
                  <div key={index} className={`text-xs p-2 rounded ${
                    msg.sender === 'doctor' ? 'bg-primary/10 ml-2 lg:ml-4' : 'bg-muted mr-2 lg:mr-4'
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-muted-foreground text-xs">{msg.time}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end space-x-2 lg:space-x-3 mt-auto">
                <Textarea
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={2}
                  className="text-xs lg:text-sm resize-none min-h-16 lg:min-h-20 flex-1"
                />
                <Button size="sm" onClick={sendMessage} className="self-end px-2 lg:px-4 py-2">
                  <Send className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Video Area - Responsive */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Video Feeds - Responsive Layout */}
        <div className="flex-1 relative overflow-hidden min-h-[300px] lg:min-h-0">
          {/* Main Remote Video - Full Screen */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <User className="h-16 w-16 lg:h-32 lg:w-32 mx-auto mb-3 lg:mb-6 opacity-50" />
              <p className="text-lg lg:text-2xl opacity-75 mb-1 lg:mb-2">
                {userRole === 'doctor' ? 'Patient Video' : 'Doctor Video'}
              </p>
              <p className="text-sm lg:text-base opacity-50">Camera will activate when call starts</p>
            </div>
          </div>

          {/* Local Video - Responsive positioning */}
          <div className="absolute top-2 lg:top-4 right-2 lg:right-4 w-32 h-24 lg:w-64 lg:h-48 bg-gray-800 rounded-lg lg:rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl">
            {!isVideoOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="text-center text-white">
                  <VideoOff className="h-4 w-4 lg:h-10 lg:w-10 mx-auto mb-1 lg:mb-2 opacity-75" />
                  <p className="text-xs lg:text-sm opacity-90">Camera Off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-1 lg:bottom-3 left-1 lg:left-3">
              <Badge variant="secondary" className="bg-black/80 text-white text-xs lg:text-sm px-2 lg:px-3 py-0.5 lg:py-1 rounded-full">
                You
              </Badge>
            </div>
          </div>
        </div>

        {/* Call Controls - Responsive */}
        <div className="p-2 lg:p-4 bg-card border-t">
          <div className="flex items-center justify-center space-x-2 lg:space-x-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full w-10 h-10 lg:w-12 lg:h-12"
            >
              {isMuted ? <MicOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Mic className="h-4 w-4 lg:h-5 lg:w-5" />}
            </Button>

            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className="rounded-full w-10 h-10 lg:w-12 lg:h-12"
            >
              {isVideoOff ? <VideoOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Video className="h-4 w-4 lg:h-5 lg:w-5" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={onEndCall}
              className="rounded-full w-10 h-10 lg:w-12 lg:h-12"
            >
              <Phone className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallScreen;
