import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';

function AppRouter() {
  const { user } = useAuth();
  const [screen, setScreen] = useState('login'); // 'login' | 'signup'

  if (user) return <Dashboard />;

  if (screen === 'signup') return <Signup onSwitchToLogin={() => setScreen('login')} />;
  return <Login onSwitchToSignup={() => setScreen('signup')} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}