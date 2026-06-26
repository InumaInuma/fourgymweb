import { useState } from 'react';
import type { User } from './domain/entities';
import { LoginPage } from './presentation/pages/LoginPage';
import { DashboardPage } from './presentation/pages/DashboardPage';
import { apiService } from './data/apiService';

function App() {
  // Inicializar estado del usuario desde localStorage si existe
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('fourgym_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser) as User;
      } catch {
        localStorage.removeItem('fourgym_user');
      }
    }
    return null;
  });

  const handleLoginSuccess = (loggedInUser: User) => {
    localStorage.setItem('fourgym_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await apiService.logout();
    localStorage.removeItem('fourgym_user');
    setUser(null);
  };

  return (
    <>
      {user ? (
        <DashboardPage user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
