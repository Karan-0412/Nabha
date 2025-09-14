import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/user-role";
import PatientDashboard from "@/components/PatientDashboard";
import DoctorDashboard from "@/components/DoctorDashboard";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userRole } = useUserContext();

  if (!userRole) return null;

  if (userRole === 'patient') {
    return (
      <PatientDashboard
        onRequestConsultation={() => navigate('/video')}
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <DoctorDashboard
      onConnectPatient={() => navigate('/video')}
      onBack={() => navigate('/')}
    />
  );
};

export default DashboardPage;
