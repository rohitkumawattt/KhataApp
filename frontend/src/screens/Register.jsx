import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  PermissionsAndroid,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Back, User, Mail, Lock, Eye, EyeCrossed, Right } from '../assets';
import { IMAGES } from '../assets/index.js';

const Register = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { register } = useAuth();
  const styles = getStyles(theme);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleNameChange = (text) => {
    setFormData((prev) => ({ ...prev, name: text }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

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

  const openGallery = () => {
    setModalVisible(false);
    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          selectionLimit: 1,
        },
        (response) => {
          if (response?.assets && response.assets.length > 0) {
            const selectedUri = response.assets[0].uri;
            if (selectedUri) {
              setFormData((prev) => ({
                ...prev,
                profileImage: selectedUri,
              }));
            }
          }
        }
      );
    } catch (error) {
      console.log('Error opening gallery:', error);
    }
  };

  const openCamera = async () => {
    setModalVisible(false);
    try {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        } catch (e) {
          console.log('Camera permission request error:', e);
        }
      }

      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          saveToPhotos: true,
        },
        (response) => {
          if (response?.assets && response.assets.length > 0) {
            const selectedUri = response.assets[0].uri;
            if (selectedUri) {
              setFormData((prev) => ({
                ...prev,
                profileImage: selectedUri,
              }));
            }
          }
        }
      );
    } catch (error) {
      console.log('Error opening camera:', error);
    }
  };

  const handleNext = async () => {
    let hasError = false;
    const newErrors = { name: '', email: '', password: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
      hasError = true;
    }

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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    setLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      profileImage: formData.profileImage, // Object from react-native-image-picker
    });
    setLoading(false);

    if (result.success) {
      navigation.navigate('verifyEmail', { email: formData.email.trim() });
    } else {
      Alert.alert('Registration Error', result.message || 'Failed to register account');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

          {/* Header Title & Subtitle */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign up to start managing your Khata
            </Text>
          </View>

          {/* Profile Image Picker Component */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              style={[
                styles.profileImageContainer,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              {formData.profileImage ? (
                <Image
                  source={{ uri: formData.profileImage }}
                  style={styles.profileImageSelected}
                />
              ) : (
                <User width={50} height={50} fill={theme.primary} />
              )}
              <View
                style={[
                  styles.profileImageOverlay,
                  { backgroundColor: theme.primary, borderColor: theme.surface },
                ]}
              >
                <Text style={styles.profileImageOverlayText}>+</Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.uploadLabel, { color: theme.primary }]}>
              {formData.profileImage ? 'Change Photo' : 'Upload Profile Photo'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Name Input */}
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                errors.name ? { borderColor: theme.amountGive } : null,
              ]}
            >
              <User width={16} height={16} fill={theme.icon} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textMuted}
                value={formData.name}
                onChangeText={handleNameChange}
              />
            </View>
            {errors.name ? (
              <Text style={[styles.errorText, { color: theme.amountGive }]}>
                {errors.name}
              </Text>
            ) : null}

            {/* Email Input */}
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
                value={formData.email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
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
                errors.password ? { borderColor: theme.amountGive } : null,
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

            {/* Next / Submit Button */}
            <TouchableOpacity
              style={[
                styles.registerBtn,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
              ]}
              activeOpacity={0.85}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.registerBtnText}>Loading...</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.registerBtnText}>Next</Text>
                  <Right width={16} height={16} fill="#FFFFFF" />
                </View>
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
              Sign up with Google
            </Text>
          </TouchableOpacity>

          {/* Login Navigation Link */}
          <TouchableOpacity
            style={styles.switchAuthBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('login')}
          >
            <Text style={[styles.switchAuthText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
              <Text style={[styles.highlight, { color: theme.primary }]}>Log In</Text>
            </Text>
          </TouchableOpacity>

          {/* Bottom Sheet Modal for Profile Photo */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <TouchableOpacity
                style={[styles.bottomSheet, { backgroundColor: theme.surface }]}
                activeOpacity={1}
              >
                <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                  Upload Profile Photo
                </Text>
                <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                  Choose an option to update your photo
                </Text>

                <View style={styles.optionsRow}>
                  {/* Gallery Option */}
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                    ]}
                    onPress={openGallery}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.optionIconContainer,
                        { backgroundColor: theme.primaryLight },
                      ]}
                    >
                      <User width={20} height={20} fill={theme.primary} />
                    </View>
                    <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>
                      Choose Gallery
                    </Text>
                    <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                      Pick from your photos
                    </Text>
                  </TouchableOpacity>

                  {/* Camera Option */}
                  <TouchableOpacity
                    style={[
                      styles.optionCard,
                      { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                    ]}
                    onPress={openCamera}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.optionIconContainer,
                        { backgroundColor: theme.amountGetBg },
                      ]}
                    >
                      <User width={20} height={20} fill={theme.amountGet} />
                    </View>
                    <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>
                      Take Photo
                    </Text>
                    <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                      Use your camera
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: theme.surfaceSubtle },
                  ]}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Register;

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
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
    marginBottom: 20,
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  profileImageSelected: {
    width: 84,
    height: 84,
    borderRadius: 42,
    resizeMode: 'cover',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profileImageOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  uploadLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
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
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  eyeBtn: {
    padding: 8,
    marginRight: -4,
  },
  registerBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 3,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  sheetHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  optionCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});