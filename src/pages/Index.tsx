import { useState } from "react";
import RoleSelection from "@/components/RoleSelection";
import PatientDashboard from "@/components/PatientDashboard";
import DoctorDashboard from "@/components/DoctorDashboard";
import VideoCallScreen from "@/components/VideoCallScreen";

type AppState = 'role-selection' | 'patient-dashboard' | 'doctor-dashboard' | 'video-call';
type UserRole = 'patient' | 'doctor' | null;

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('role-selection');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const handleRoleSelect = (role: 'patient' | 'doctor') => {
    setUserRole(role);
    if (role === 'patient') {
      setCurrentState('patient-dashboard');
    } else {
      setCurrentState('doctor-dashboard');
    }
  };

  const handleRequestConsultation = () => {
    // In a real app, this would create a document in Firestore
    setCurrentState('video-call');
    setSelectedPatientId('patient-1'); // Mock patient ID
  };

  const handleConnectPatient = (patientId: string) => {
    // In a real app, this would update the patient's status to 'active'
    setSelectedPatientId(patientId);
    setCurrentState('video-call');
  };

  const handleEndCall = () => {
    // Return to appropriate dashboard based on user role
    if (userRole === 'patient') {
      setCurrentState('patient-dashboard');
    } else {
      setCurrentState('doctor-dashboard');
    }
  };

  const handleBack = () => {
    setCurrentState('role-selection');
    setUserRole(null);
  };

  if (currentState === 'role-selection') {
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  if (currentState === 'patient-dashboard') {
    return (
      <PatientDashboard 
        onRequestConsultation={handleRequestConsultation}
        onBack={handleBack}
      />
    );
  }

  if (currentState === 'doctor-dashboard') {
    return (
      <DoctorDashboard 
        onConnectPatient={handleConnectPatient}
        onBack={handleBack}
      />
    );
  }

  if (currentState === 'video-call' && userRole) {
    return (
      <VideoCallScreen 
        patientId={selectedPatientId}
        userRole={userRole}
        onEndCall={handleEndCall}
      />
    );
  }

  return null;
};

export default Index;
