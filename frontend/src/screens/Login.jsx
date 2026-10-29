import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Back, Mail, Lock, Eye, EyeCrossed, IMAGES } from '../assets';

const Login = ({ navigation }) => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const styles = getStyles(theme);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (text) => {
    setFormData((prev) => ({ ...prev, email: text }));
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (text) => {
    setFormData((prev) => ({ ...prev, password: text }));
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleLogin = async () => {
    let hasError = false;
    const newErrors = { email: '', password: '' };
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
      hasError = true;
    } else {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
        hasError = true;
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
      hasError = true;
    }
    setErrors(newErrors);
    if (hasError) return;

    setLoading(true);
    const result = await login(formData.email.trim(), formData.password);
    // console.log("LOGIN RESULT : ", result);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message || 'Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
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
              navigation.navigate('welcome');
            }
          }}
        >
          <Back width={16} height={16} fill={theme.textPrimary} />
        </TouchableOpacity>

        {/* Header Logo, Title & Subtitle */}
        <View style={styles.header}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Image source={IMAGES.Logo} style={styles.logoImage} />
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Log in to access your Khata account
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Email Input */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Mail width={16} height={16} fill={theme.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Email Address"
              placeholderTextColor={theme.textMuted}
              value={formData.email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              importantForAutofill="yes"
            />
          </View>
          {errors.email ? (
            <Text style={[styles.errorText, { color: theme.amountGive }]}>
              {errors.email}
            </Text>
          ) : null}

          {/* Password Input with Show/Hide Toggle */}
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Lock width={16} height={16} fill={theme.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Password"
              placeholderTextColor={theme.textMuted}
              value={formData.password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              importantForAutofill="yes"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              {showPassword ? (
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

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('forgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
            ]}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textMuted }]}>
            Or continue with
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[
            styles.googleBtn,
            { backgroundColor: theme.disable, borderColor: theme.border },
          ]}
          activeOpacity={0.85}
          onPress={() => {
            Alert.alert('Comming Soon!', 'We are working on it... you will get this soon. For now you can create account with your valid email.');
          }}
        >
          <Image source={IMAGES.Google} style={styles.googleIcon} />
          <Text style={[styles.googleBtnText, { color: theme.textPrimary }]}>
            Sign in with Google
          </Text>
        </TouchableOpacity>

        {/* Register Navigation Link */}
        <TouchableOpacity
          style={styles.switchAuthBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('register')}
        >
          <Text style={[styles.switchAuthText, { color: theme.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={[styles.highlight, { color: theme.primary }]}>Register</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

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
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoImage: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 12,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 52,
    borderRadius: 14,
    marginBottom: 24,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  switchAuthBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchAuthText: {
    fontSize: 14,
  },
  highlight: {
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
});
