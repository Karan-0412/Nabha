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

  // Mock patient data
  const patientData = {
    name: "Jane Smith",
    age: 28,
    sex: "Female",
    dateJoined: "4/22/2019",
    claimsShared: "Yes"
  };

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
    <div className="h-full bg-video-bg flex">
      {/* Left Sidebar - Patient Information */}
      <div className="w-80 bg-medical-sidebar border-r flex flex-col">
        {/* Patient Information */}
        <Card className="m-4 mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Patient Name:</span>
              <span className="text-sm font-medium">{patientData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Age:</span>
              <span className="text-sm font-medium">{patientData.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sex:</span>
              <span className="text-sm font-medium">{patientData.sex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date Joined:</span>
              <span className="text-sm font-medium">{patientData.dateJoined}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Claims Shared:</span>
              <span className="text-sm font-medium">{patientData.claimsShared}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              <FileText className="h-4 w-4 mr-2" />
              View Intake Form
            </Button>
          </CardContent>
        </Card>

        {/* Rx Status */}
        <Card className="mx-4 mb-2">
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

        {/* Order History */}
        <Card className="mx-4 mb-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Order History</CardTitle>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground h-6 px-2 text-xs">
                New Prescription
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {orderHistory.map((order, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{order.id}</span>
                <span className="text-muted-foreground">{order.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Messages - Resized */}
        <Card className="mx-4 flex-1 flex flex-col min-h-[200px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chat</CardTitle>
              <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                Templates
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-2 mb-3 overflow-y-auto min-h-[120px]">
              {messages.map((msg, index) => (
                <div key={index} className={`text-xs p-2 rounded ${
                  msg.sender === 'doctor' ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-muted-foreground text-xs">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="flex items-end space-x-3 mt-auto">
              <Textarea
                placeholder="Type a message (Shift+Enter for new line)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={4}
                className="text-sm resize-none min-h-28 max-h-48 flex-1"
              />
              <Button size="default" onClick={sendMessage} className="self-end px-4 py-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Feeds - Updated Layout */}
        <div className="flex-1 relative overflow-hidden">
          {/* Main Remote Video - Full Screen */}
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <User className="h-32 w-32 mx-auto mb-6 opacity-50" />
              <p className="text-2xl opacity-75 mb-2">
                {userRole === 'doctor' ? 'Patient Video' : 'Doctor Video'}
              </p>
              <p className="text-base opacity-50">Camera will activate when call starts</p>
            </div>
          </div>

          {/* Local Video - Floating in corner */}
          <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl">
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
                  <VideoOff className="h-10 w-10 mx-auto mb-2 opacity-75" />
                  <p className="text-sm opacity-90">Camera Off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-black/80 text-white text-sm px-3 py-1 rounded-full">
                You
              </Badge>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-4 bg-card border-t">
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full w-12 h-12"
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className="rounded-full w-12 h-12"
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={onEndCall}
              className="rounded-full w-12 h-12"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallScreen;