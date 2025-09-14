import { useNavigate } from "react-router-dom";
import VideoCallScreen from "@/components/VideoCallScreen";

const VideoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full">
      <VideoCallScreen
        patientId="patient-1"
        userRole="doctor"
        onEndCall={() => navigate("/")}
      />
    </div>
  );
};

export default VideoPage;
