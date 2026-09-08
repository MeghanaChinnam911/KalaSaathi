import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Navigation Flow State: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'OTP_VERIFICATION' | 'PROFILE_SETUP' | 'AUTH_SUCCESS' | 'DASHBOARD'
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  
  // App Language preference: 'en' | 'hi' | 'te' etc.
  const [language, setLanguage] = useState('en');

  // Active User session
  const [user, setUser] = useState(null);
  
  // Pending registration or forgot password state for OTP step
  const [pendingAuth, setPendingAuth] = useState({
    flow: 'SIGNUP', // 'SIGNUP' or 'FORGOT_PASSWORD'
    phone: '',
    countryCode: '+91',
    userId: '',
    tempData: null
  });

  // Global Toast / Alert message state
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const clearToast = () => setToast(null);

  // Auth Handlers
  const handleLogin = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await authService.login(identifier, password);
      setUser(res.user);
      showToast(res.message, 'success');
      // If user has not completed profile, go to profile setup; else dashboard
      if (!res.user.profileCompleted) {
        setCurrentScreen('PROFILE_SETUP');
      } else {
        setCurrentScreen('DASHBOARD');
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      const res = await authService.loginWithSocial(provider);
      setUser(res.user);
      showToast(res.message, 'success');
      setCurrentScreen('PROFILE_SETUP');
    } catch (err) {
      showToast(err.message || 'Social login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSignup = async (signupData) => {
    setLoading(true);
    try {
      const res = await authService.register(signupData);
      setPendingAuth({
        flow: 'SIGNUP',
        phone: signupData.phone,
        countryCode: signupData.countryCode || '+91',
        userId: signupData.userId,
        tempData: signupData
      });
      showToast(res.message, 'success');
      setCurrentScreen('OTP_VERIFICATION');
    } catch (err) {
      showToast(err.message || 'Signup failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartForgotPassword = async (identifier) => {
    setLoading(true);
    try {
      const res = await authService.forgotPassword(identifier);
      setPendingAuth({
        flow: 'FORGOT_PASSWORD',
        phone: identifier,
        countryCode: '+91',
        userId: identifier,
        tempData: { identifier }
      });
      showToast(res.message, 'success');
      setCurrentScreen('OTP_VERIFICATION');
    } catch (err) {
      showToast(err.message || 'Failed to send OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    setLoading(true);
    try {
      await authService.verifyOTP(pendingAuth.phone || pendingAuth.userId, otpCode);
      showToast('Verification successful!', 'success');

      if (pendingAuth.flow === 'SIGNUP') {
        // Create user profile skeleton & move to Profile Setup
        const newUser = {
          id: 'artisan_' + Date.now(),
          fullName: pendingAuth.tempData?.fullName || 'New Artisan',
          phone: pendingAuth.phone,
          countryCode: pendingAuth.countryCode,
          email: pendingAuth.tempData?.email || '',
          userId: pendingAuth.userId,
          category: '',
          language: language,
          profileCompleted: false
        };
        setUser(newUser);
        setCurrentScreen('PROFILE_SETUP');
      } else if (pendingAuth.flow === 'FORGOT_PASSWORD') {
        // Navigate to Create New Password screen inside Forgot Password flow
        setCurrentScreen('RESET_PASSWORD_NEW');
      }
    } catch (err) {
      showToast(err.message || 'OTP verification failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    setLoading(true);
    try {
      const res = await authService.resetPassword(pendingAuth.userId, newPassword);
      showToast(res.message, 'success');
      setCurrentScreen('LOGIN');
    } catch (err) {
      showToast(err.message || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfileSetup = async (profileData) => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(profileData);
      setUser(res.user);
      setCurrentScreen('AUTH_SUCCESS');
    } catch (err) {
      showToast(err.message || 'Failed to save profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentScreen('LOGIN');
    showToast('Logged out safely.', 'info');
  };

  const demoQuickLogin = () => {
    handleLogin('ramu_weaver', 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        user,
        setUser,
        pendingAuth,
        setPendingAuth,
        language,
        setLanguage,
        toast,
        showToast,
        clearToast,
        loading,
        handleLogin,
        handleSocialLogin,
        handleStartSignup,
        handleStartForgotPassword,
        handleVerifyOTP,
        handleResetPassword,
        handleCompleteProfileSetup,
        handleLogout,
        demoQuickLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
