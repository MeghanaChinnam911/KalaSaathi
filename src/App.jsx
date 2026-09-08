import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileFrame } from './components/MobileFrame';
import { AuthNavigator } from './navigation/AuthNavigator';
import { Toast } from './components/Toast';

const AppContent = () => {
  const { toast, clearToast } = useAuth();

  return (
    <MobileFrame>
      <Toast toast={toast} onClose={clearToast} />
      <AuthNavigator />
    </MobileFrame>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
