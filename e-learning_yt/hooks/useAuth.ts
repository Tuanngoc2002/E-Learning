import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  organizationID: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  jwt: string | null;
  organizationID: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    jwt: null,
    organizationID: '',
  });

  useEffect(() => {
    // Initialize auth state from cookies
    const jwt = Cookies.get('jwt');
    const userRole = Cookies.get('userRole');
    const userName = Cookies.get('userName');
    const userEmail = Cookies.get('email');
    const userId = Cookies.get('userId');
    const isAuthenticated = Cookies.get('isAuthenticated') === 'true';
    const organizationID = Cookies.get('organizationID');

    if (jwt && userRole && userName && userId && isAuthenticated) {
      setAuthState({
        isAuthenticated: true,
        user: {
          id: userId,
          username: userName,
          email: userEmail || '',
          role: userRole,
          organizationID: organizationID || '',
        },
        jwt,
        organizationID: organizationID || '',
      });
    }
    setLoading(false);
  }, []);

  const login = (jwt: string, user: User) => {
    // Set cookies
    Cookies.set('jwt', jwt, { path: '/' });
    Cookies.set('userRole', user.role, { path: '/' });
    Cookies.set('isAuthenticated', 'true', { path: '/' });
    Cookies.set('userName', user.username, { path: '/' });
    Cookies.set('userId', user.id, { path: '/' });
    Cookies.set('email', user.email, { path: '/' });
    Cookies.set('organizationID', user.organizationID, { path: '/' });
    // Update state
    setAuthState({
      isAuthenticated: true,
      user,
      jwt,
      organizationID: user.organizationID,
    });
  };

  const logout = () => {
    // Remove cookies
    Cookies.remove('jwt', { path: '/' });
    Cookies.remove('userRole', { path: '/' });
    Cookies.remove('isAuthenticated', { path: '/' });
    Cookies.remove('userName', { path: '/' });
    Cookies.remove('userId', { path: '/' });
    Cookies.remove('email', { path: '/' });
    Cookies.remove('organizationID', { path: '/' });
    // Update state
    setAuthState({
      isAuthenticated: false,
      user: null,
      jwt: null,
      organizationID: '',
    });
  };

  return {
    ...authState,
    login,
    logout,
    loading,
  };
}; 