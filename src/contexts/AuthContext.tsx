import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  language: string;
  preferences: {
    language: string;
    simpleMode: boolean;
    voiceEnabled: boolean;
    highContrast: boolean;
  };
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  language: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check localStorage for user data
      const storedUser = localStorage.getItem('autopom_user');
      const storedToken = localStorage.getItem('autopom_token');

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check for demo user credentials
      if (email === 'demo@autopom.app' && password === 'demo123') {
        const demoUser: User = {
          id: 'demo_user_001',
          name: 'Priya Sharma',
          email: 'demo@autopom.app',
          language: 'hi',
          preferences: {
            language: 'hi',
            simpleMode: false,
            voiceEnabled: true,
            highContrast: false,
          },
          createdAt: '2024-01-01T00:00:00.000Z',
        };

        // Store demo user data
        localStorage.setItem('autopom_user', JSON.stringify(demoUser));
        localStorage.setItem('autopom_token', 'demo_token_secure_001');

        setUser(demoUser);
        toast.success('Welcome back, Priya! 🎉');
        return true;
      }

      // Simulate API call for other users
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data - replace with actual API response
      const userData: User = {
        id: 'user_' + Date.now(),
        name: 'Demo User',
        email: email,
        language: 'en',
        preferences: {
          language: 'en',
          simpleMode: false,
          voiceEnabled: true,
          highContrast: false,
        },
        createdAt: new Date().toISOString(),
      };

      // Store user data
      localStorage.setItem('autopom_user', JSON.stringify(userData));
      localStorage.setItem('autopom_token', 'demo_token_' + Date.now());

      setUser(userData);
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API call - replace with actual registration
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create user object
      const newUser: User = {
        id: 'user_' + Date.now(),
        name: userData.name,
        email: userData.email,
        language: userData.language,
        preferences: {
          language: userData.language,
          simpleMode: false,
          voiceEnabled: true,
          highContrast: false,
        },
        createdAt: new Date().toISOString(),
      };

      // Store user data
      localStorage.setItem('autopom_user', JSON.stringify(newUser));
      localStorage.setItem('autopom_token', 'demo_token_' + Date.now());

      setUser(newUser);
      toast.success('Account created successfully! Welcome to AutoPom!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Clear stored data
      localStorage.removeItem('autopom_user');
      localStorage.removeItem('autopom_token');

      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('autopom_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
