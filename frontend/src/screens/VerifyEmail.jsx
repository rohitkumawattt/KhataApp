import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Back, Mail } from '../assets';

const VerifyEmail = ({ navigation, route }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { verifyEmailOtp, resendVerificationOtp } = useAuth();

  const email = route.params?.email || 'user@example.com';
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text.length > 0 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);

    const result = await resendVerificationOtp(email);
    if (result.success) {
      Alert.alert('Verification Code Sent', `A new 4-digit code has been sent to ${email}`);
    } else {
      Alert.alert('Error', result.message || 'Failed to resend code');
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 4) {
      Alert.alert('Incomplete Code', 'Please enter the full 4-digit verification code.');
      return;
    }

    setLoading(true);
    const result = await verifyEmailOtp(email, code);
    setLoading(false);

    if (result.success) {
      // RootNavigation will automatically route to MainNavigation because user & tokens are set in AuthContext
      Alert.alert('Success 🎉', 'Your email has been verified successfully!');
    } else {
      Alert.alert('Verification Failed', result.message || 'Invalid or expired OTP');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back Button */}
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('register');
          }
        }}
      >
        <Back width={16} height={16} fill={theme.textPrimary} />
      </TouchableOpacity>

      {/* Hero Icon */}
      <View style={styles.heroSection}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: theme.primaryLight, borderColor: theme.primary },
          ]}
        >
          <Mail width={32} height={32} fill={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Verify Your Email</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          We've sent a 4-digit verification code to
        </Text>
        <Text style={[styles.emailBadge, { color: theme.primary }]}>{email}</Text>
      </View>

      {/* OTP Input Fields */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            style={[
              styles.otpBox,
              {
                backgroundColor: theme.surfaceSubtle,
                borderColor: digit !== '' ? theme.primary : theme.border,
                color: theme.textPrimary,
              },
            ]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Resend Code Timer */}
      <View style={styles.resendSection}>
        <Text style={[styles.resendText, { color: theme.textSecondary }]}>
          Didn't receive the code?{' '}
        </Text>
        {canResend ? (
          <TouchableOpacity onPress={handleResendCode} activeOpacity={0.7}>
            <Text style={[styles.resendLink, { color: theme.primary }]}>Resend Code</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.timerText, { color: theme.textSecondary }]}>
            Resend in{' '}
            <Text style={[styles.timerHighlight, { color: theme.primary }]}>{timer}s</Text>
          </Text>
        )}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[
          styles.verifyBtn,
          { backgroundColor: theme.primary, shadowColor: theme.primary },
        ]}
        activeOpacity={0.85}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.verifyBtnText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default VerifyEmail;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
  emailBadge: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  otpBox: {
    width: 58,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  timerText: {
    fontSize: 14,
  },
  timerHighlight: {
    fontWeight: '700',
  },
  verifyBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
