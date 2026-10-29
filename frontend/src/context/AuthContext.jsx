import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext(null);

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://localhost:3000/api' // PC Wi-Fi IPv4 Address
    : 'http://localhost:3000/api';

// const BASE_URL = "https://khataapp-backend-0uuc.onrender.com/api"

const STORAGE_KEYS = {
  accessToken: '@khata_access_token',
  refreshToken: '@khata_refresh_token',
  user: '@khata_user',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.accessToken);
      await AsyncStorage.removeItem(STORAGE_KEYS.refreshToken);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
    } catch (e) {
      console.log('Clear storage error:', e);
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const restoreSession = async () => {
    try {
      const storedAccessToken = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);
      const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.user);

      if (!storedRefreshToken) {
        setLoading(false);
        return;
      }

      if (storedAccessToken) setAccessToken(storedAccessToken);
      if (storedRefreshToken) setRefreshToken(storedRefreshToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }

      // Refresh token se naya access token le rahe hain
      const newAccessToken = await refreshAccessToken(storedRefreshToken);
      if (newAccessToken) {
        await getCurrentUser(newAccessToken);
      } else {
        await clearSession();
      }
    } catch (error) {
      console.log('Restore Session Error:', error);
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, profileImage }) => {
    try {
      const formData = new FormData();

      // Text fields append karein
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);

      // Image tabhi append karein jab select hui ho
      if (profileImage) {
        const uri = typeof profileImage === 'string' ? profileImage : profileImage.uri;
        if (uri) {
          formData.append('profileImage', {
            uri: uri,
            type: (typeof profileImage === 'object' && profileImage.type) || 'image/jpeg',
            name: (typeof profileImage === 'object' && profileImage.fileName) || 'profile.jpg',
          });
        }
      }

      const response = await axios.post(`${BASE_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // console.log("REGISTRATION DATA : ", response);
      return {
        success: true,
        message: response.data?.message || 'Registration successful',
        user: response.data?.user,
      };
    } catch (error) {
      // console.log('Register Error:', error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message: errorMessage };
    }
  };

  const resendVerificationOtp = async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/resend-verification-otp`, {
        email,
      });

      return {
        success: true,
        message: response.data?.message || 'OTP sent successfully',
      };
    } catch (error) {
      // console.log('Resend OTP Error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to resend OTP';
      return { success: false, message: errorMessage };
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-email`, {
        email,
        otp,
      });

      const data = response.data;

      // Agar tokens mile to phone memory me save kar lo
      if (data.accessToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      }
      if (data.refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
      }
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
      }

      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);

      return {
        success: true,
        message: data.message || 'Email verified successfully',
        user: data.user,
      };
    } catch (error) {
      // console.log('Verify Email Error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'OTP verification failed';
      return { success: false, message: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      const data = response.data;
      // console.log('LOGIN DATA:', data);

      // 1. Phone memory (AsyncStorage) me save karte hain
      if (data.accessToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      }
      if (data.refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
      }
      if (data.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
      }

      // 2. React state update karte hain
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);

      return {
        success: true,
        message: data.message || 'Login successful',
        user: data.user,
      };
    } catch (error) {
      // console.log('Login Error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email,
      });

      return {
        success: true,
        message: response.data?.message || 'Reset OTP sent to email',
      };
    } catch (error) {
      // console.log('Forgot Password Error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to send OTP';
      return { success: false, message: errorMessage };
    }
  };

  const verifyResetOtp = async (email, otp) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify-reset-otp`, {
        email,
        otp,
      });

      return {
        success: true,
        message: response.data?.message || 'OTP verified successfully',
      };
    } catch (error) {
      // console.log('Verify Reset OTP Error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Invalid OTP';
      return { success: false, message: errorMessage };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      return {
        success: true,
        message: response.data?.message || 'Password reset successfully',
      };
    } catch (error) {
      // console.log('Reset Password Error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to reset password';
      return { success: false, message: errorMessage };
    }
  };

  const refreshAccessToken = async (storedRefreshToken = refreshToken) => {
    try {
      if (!storedRefreshToken) return null;

      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken: storedRefreshToken,
      });

      const newAccessToken = response.data?.accessToken;
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.accessToken, newAccessToken);
        return newAccessToken;
      }

      return null;
    } catch (error) {
      // console.log('Refresh Token Error:', error);
      return null;
    }
  };

  const getCurrentUser = async (token = accessToken) => {
    try {
      if (!token) return false;

      const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.user) {
        setUser(response.data.user);
        await AsyncStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(response.data.user)
        );
        return true;
      }

      return false;
    } catch (error) {
      // console.log('Get Current User Error:', error);
      return false;
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const formData = new FormData();

      // 1. Explicitly append Text Fields
      if (updatedData.name) formData.append('name', updatedData.name);
      if (updatedData.email) formData.append('email', updatedData.email);
      if (updatedData.phone !== undefined) formData.append('phone', updatedData.phone);

      // 2. Handle React Native Image Attachment
      // Image tabhi bhejenge jab user ne ImagePicker se nayi file pick ki ho ({ uri, type, fileName })
      const img = updatedData.profileImage;
      if (img && img.uri && !img.url) {
        formData.append('profileImage', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || 'profile.jpg',
        });
      }

      // console.log('Sending Profile Update Request...');

      const response = await axios.put(`${BASE_URL}/auth/update-profile`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUser(response.data.user);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.data.user));
      }

      return { success: true, message: response.data?.message || 'Profile updated successfully' };
    } catch (error) {
      // console.log('Update user error details:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Update failed'
      };
    }
  };


  const logout = async () => {
    try {
      if (accessToken) {
        await axios.post(
          `${BASE_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      // console.log('Logout Error:', error);
    } finally {
      await clearSession();
    }
  };

  // App start par automatically session load ho
  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        isAuthenticated: !!user && !!refreshToken,
        BASE_URL,
        register,
        login,
        logout,
        verifyEmailOtp,
        resendVerificationOtp,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        refreshAccessToken,
        getCurrentUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =====================================================
// 4. CUSTOM HOOK
// =====================================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

export default AuthContext;