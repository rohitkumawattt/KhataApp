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
import { Back, Eye, EyeCrossed, Lock, Mail } from '../assets';

const ForgotPassword = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();

  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);

  // Step 1 State
  const [email, setEmail] = useState('');

  // Step 2 State
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Step 3 State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });

  // Timer logic for Step 2
  useEffect(() => {
    let interval = null;
    if (currentStep === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, timer]);

  // Step 1 Action: Send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email Address is required.' }));
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, email: '' }));
    setLoading(true);
    const result = await forgotPassword(email.trim());
    setLoading(false);

    if (result.success) {
      setTimer(30);
      setCanResend(false);
      setCurrentStep(2);
    } else {
      Alert.alert('Error', result.message || 'Failed to send OTP code');
    }
  };

  // Step 2 Action: OTP Change & Verification
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: '' }));
    }

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

    const result = await forgotPassword(email.trim());
    if (result.success) {
      Alert.alert('Code Resent', `A new OTP has been sent to ${email}`);
    } else {
      Alert.alert('Error', result.message || 'Failed to resend OTP');
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 4) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter the full 4-digit code.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, otp: '' }));

    setLoading(true);
    const result = await verifyResetOtp(email.trim(), code);
    setLoading(false);

    if (result.success) {
      setCurrentStep(3);
    } else {
      Alert.alert('Verification Failed', result.message || 'Invalid or expired OTP');
    }
  };

  // Step 3 Action: Reset Password
  const handleResetPassword = async () => {
    let hasError = false;
    const newErrors = { password: '', confirmPassword: '' };

    if (!newPassword) {
      newErrors.password = 'New Password is required.';
      hasError = true;
    } else if (newPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
      hasError = true;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      hasError = true;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    if (hasError) return;

    const code = otp.join('');
    setLoading(true);
    const result = await resetPassword(email.trim(), code, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Password Reset Successful 🎉',
        'Your password has been changed successfully. Please log in with your new password.',
        [
          {
            text: 'Back to Login',
            onPress: () => navigation.navigate('login'),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.message || 'Failed to reset password');
    }
  };

  // Back button behavior
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('login');
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
        onPress={handleBack}
      >
        <Back width={16} height={16} fill={theme.textPrimary} />
      </TouchableOpacity>

      {/* Step Indicator Header */}
      <View style={styles.stepperWrapper}>
        {/* Line Connector */}
        <View style={[styles.stepperLineTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.stepperLineFill,
              {
                backgroundColor: theme.primary,
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
              },
            ]}
          />
        </View>

        {/* Step 1 Circle */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              { backgroundColor: theme.surface, borderColor: theme.border },
              currentStep >= 1 && { borderColor: theme.primary, backgroundColor: theme.primaryLight },
              currentStep > 1 && { borderColor: theme.amountGet, backgroundColor: theme.amountGetBg },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                { color: theme.textMuted },
                currentStep >= 1 && { color: theme.primary },
              ]}
            >
              {currentStep > 1 ? '✓' : '1'}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              { color: theme.textMuted },
              currentStep >= 1 && { color: theme.textPrimary, fontWeight: '700' },
            ]}
          >
            Email
          </Text>
        </View>

        {/* Step 2 Circle */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              { backgroundColor: theme.surface, borderColor: theme.border },
              currentStep >= 2 && { borderColor: theme.primary, backgroundColor: theme.primaryLight },
              currentStep > 2 && { borderColor: theme.amountGet, backgroundColor: theme.amountGetBg },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                { color: theme.textMuted },
                currentStep >= 2 && { color: theme.primary },
              ]}
            >
              {currentStep > 2 ? '✓' : '2'}
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              { color: theme.textMuted },
              currentStep >= 2 && { color: theme.textPrimary, fontWeight: '700' },
            ]}
          >
            Verify
          </Text>
        </View>

        {/* Step 3 Circle */}
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              { backgroundColor: theme.surface, borderColor: theme.border },
              currentStep >= 3 && { borderColor: theme.primary, backgroundColor: theme.primaryLight },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                { color: theme.textMuted },
                currentStep >= 3 && { color: theme.primary },
              ]}
            >
              3
            </Text>
          </View>
          <Text
            style={[
              styles.stepLabel,
              { color: theme.textMuted },
              currentStep >= 3 && { color: theme.textPrimary, fontWeight: '700' },
            ]}
          >
            Reset
          </Text>
        </View>
      </View>

      {/* STEP 1: EMAIL INPUT */}
      {currentStep === 1 && (
        <View>
          <View style={styles.heroSection}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
            >
              <Mail width={32} height={32} fill={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Forgot Password?</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your registered email address below to receive an OTP code
            </Text>
          </View>

          <View style={styles.form}>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                errors.email ? { borderColor: theme.amountGive } : null,
              ]}
            >
              <Mail width={16} height={16} fill={theme.icon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Email Address"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email ? (
              <Text style={[styles.errorText, { color: theme.amountGive }]}>{errors.email}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
              ]}
              activeOpacity={0.85}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Send OTP Code</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {currentStep === 2 && (
        <View>
          <View style={styles.heroSection}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
            >
              <Lock width={32} height={32} fill={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Enter Verification Code
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We've sent a 4-digit code to
            </Text>
            <Text style={[styles.emailHighlight, { color: theme.primary }]}>{email}</Text>
          </View>

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
          {errors.otp ? (
            <Text style={[styles.errorText, { color: theme.amountGive, textAlign: 'center' }]}>
              {errors.otp}
            </Text>
          ) : null}

          <View style={styles.resendSection}>
            <Text style={[styles.resendText, { color: theme.textSecondary }]}>
              Didn't receive code?{' '}
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

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
            ]}
            activeOpacity={0.85}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Verify Code</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {currentStep === 3 && (
        <View>
          <View style={styles.heroSection}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
            >
              <Lock width={32} height={32} fill={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Set a new secure password for your account
            </Text>
          </View>

          <View style={styles.form}>
            {/* New Password */}
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                errors.password ? { borderColor: theme.amountGive } : null,
              ]}
            >
              <Lock width={16} height={16} fill={theme.icon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="New Password"
                placeholderTextColor={theme.textMuted}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                {showNewPassword ? (
                  <Eye width={16} height={16} fill={theme.icon} />
                ) : (
                  <EyeCrossed width={16} height={16} fill={theme.icon} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.errorText, { color: theme.amountGive }]}>
                {errors.password}
              </Text>
            ) : null}

            {/* Confirm Password */}
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                errors.confirmPassword ? { borderColor: theme.amountGive } : null,
              ]}
            >
              <Lock width={16} height={16} fill={theme.icon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Confirm New Password"
                placeholderTextColor={theme.textMuted}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? (
                  <Eye width={16} height={16} fill={theme.icon} />
                ) : (
                  <EyeCrossed width={16} height={16} fill={theme.icon} />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={[styles.errorText, { color: theme.amountGive }]}>
                {errors.confirmPassword}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
              ]}
              activeOpacity={0.85}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ForgotPassword;

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
    marginBottom: 20,
  },
  stepperWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  stepperLineTrack: {
    position: 'absolute',
    left: 48,
    right: 48,
    top: 18,
    height: 3,
    zIndex: 0,
  },
  stepperLineFill: {
    height: '100%',
  },
  stepItem: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  emailHighlight: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    marginLeft: 10,
  },
  eyeBtn: {
    padding: 8,
    marginRight: -4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  otpBox: {
    width: 56,
    height: 58,
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
    marginBottom: 24,
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
});
