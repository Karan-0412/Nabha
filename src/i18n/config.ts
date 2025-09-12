import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      'welcome': 'Welcome',
      'login': 'Login',
      'signup': 'Sign Up',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'name': 'Full Name',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      
      // Role Selection
      'selectRole': 'Select Your Role',
      'patient': 'Patient',
      'doctor': 'Doctor',
      'patientDesc': 'Get medical consultations and manage your health',
      'doctorDesc': 'Provide medical consultations and manage patients',
      
      // Dashboard
      'dashboard': 'Dashboard',
      'appointments': 'Appointments',
      'videoCall': 'Video Call',
      'documents': 'Documents',
      'settings': 'Settings',
      'requestConsultation': 'Request Consultation',
      'upcomingAppointments': 'Upcoming Appointments',
      'recentDocuments': 'Recent Documents',
      
      // Video Call
      'patientInfo': 'Patient Information',
      'rxStatus': 'Rx Status',
      'orderHistory': 'Order History',
      'chat': 'Chat',
      'endCall': 'End Call',
      'muteUnmute': 'Mute/Unmute',
      'videoOnOff': 'Video On/Off',
      
      // Authentication
      'signInToAccount': 'Sign in to your account',
      'createNewAccount': 'Create a new account',
      'alreadyHaveAccount': 'Already have an account?',
      'dontHaveAccount': "Don't have an account?",
      'signInHere': 'Sign in here',
      'signUpHere': 'Sign up here',
    }
  },
  es: {
    translation: {
      // Common
      'welcome': 'Bienvenido',
      'login': 'Iniciar Sesión',
      'signup': 'Registrarse',
      'email': 'Correo Electrónico',
      'password': 'Contraseña',
      'confirmPassword': 'Confirmar Contraseña',
      'name': 'Nombre Completo',
      'submit': 'Enviar',
      'cancel': 'Cancelar',
      'loading': 'Cargando...',
      'error': 'Error',
      'success': 'Éxito',
      
      // Role Selection
      'selectRole': 'Seleccione su Rol',
      'patient': 'Paciente',
      'doctor': 'Doctor',
      'patientDesc': 'Obtenga consultas médicas y administre su salud',
      'doctorDesc': 'Brinde consultas médicas y administre pacientes',
      
      // Dashboard
      'dashboard': 'Panel de Control',
      'appointments': 'Citas',
      'videoCall': 'Videollamada',
      'documents': 'Documentos',
      'settings': 'Configuración',
      'requestConsultation': 'Solicitar Consulta',
      'upcomingAppointments': 'Próximas Citas',
      'recentDocuments': 'Documentos Recientes',
      
      // Video Call
      'patientInfo': 'Información del Paciente',
      'rxStatus': 'Estado de Rx',
      'orderHistory': 'Historial de Pedidos',
      'chat': 'Chat',
      'endCall': 'Terminar Llamada',
      'muteUnmute': 'Silenciar/Activar',
      'videoOnOff': 'Video Encendido/Apagado',
      
      // Authentication
      'signInToAccount': 'Inicia sesión en tu cuenta',
      'createNewAccount': 'Crear una nueva cuenta',
      'alreadyHaveAccount': '¿Ya tienes una cuenta?',
      'dontHaveAccount': '¿No tienes una cuenta?',
      'signInHere': 'Inicia sesión aquí',
      'signUpHere': 'Regístrate aquí',
    }
  },
  fr: {
    translation: {
      // Common
      'welcome': 'Bienvenue',
      'login': 'Se Connecter',
      'signup': "S'inscrire",
      'email': 'E-mail',
      'password': 'Mot de Passe',
      'confirmPassword': 'Confirmer le Mot de Passe',
      'name': 'Nom Complet',
      'submit': 'Soumettre',
      'cancel': 'Annuler',
      'loading': 'Chargement...',
      'error': 'Erreur',
      'success': 'Succès',
      
      // Role Selection
      'selectRole': 'Sélectionnez votre Rôle',
      'patient': 'Patient',
      'doctor': 'Docteur',
      'patientDesc': 'Obtenez des consultations médicales et gérez votre santé',
      'doctorDesc': 'Fournissez des consultations médicales et gérez les patients',
      
      // Dashboard
      'dashboard': 'Tableau de Bord',
      'appointments': 'Rendez-vous',
      'videoCall': 'Appel Vidéo',
      'documents': 'Documents',
      'settings': 'Paramètres',
      'requestConsultation': 'Demander une Consultation',
      'upcomingAppointments': 'Prochains Rendez-vous',
      'recentDocuments': 'Documents Récents',
      
      // Video Call
      'patientInfo': 'Information du Patient',
      'rxStatus': 'Statut Rx',
      'orderHistory': 'Historique des Commandes',
      'chat': 'Discussion',
      'endCall': 'Terminer l\'Appel',
      'muteUnmute': 'Couper/Activer le Son',
      'videoOnOff': 'Vidéo Activée/Désactivée',
      
      // Authentication
      'signInToAccount': 'Connectez-vous à votre compte',
      'createNewAccount': 'Créer un nouveau compte',
      'alreadyHaveAccount': 'Vous avez déjà un compte?',
      'dontHaveAccount': "Vous n'avez pas de compte?",
      'signInHere': 'Connectez-vous ici',
      'signUpHere': 'Inscrivez-vous ici',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;