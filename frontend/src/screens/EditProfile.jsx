import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Back, Mail, Phone, PlusBtn, Trash, Update, User } from '../assets';
import personImageDefault from '../assets/images/personImage.png';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const EditProfile = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { user, updateUser } = useAuth();
    const styles = getStyles(theme);

    // Form States (Pre-filled with logged-in user profile data)
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [name, setName] = useState(user?.name);
    const [email, setEmail] = useState(user?.email);
    const [phone, setPhone] = useState(user?.phone || '');

    // UI States
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [errors, setErrors] = useState({});

    // Request Android Camera Permission
    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'KhataApp needs access to your camera to take a profile photo.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'Allow',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Camera permission error:', err);
                return false;
            }
        }
        return true;
    };

    // Pick Image from Gallery
    const handlePickGallery = async () => {
        setImageModalVisible(false);
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 1,
            });

            if (result.didCancel) return;

            if (result.errorCode) {
                Alert.alert('Gallery Error', result.errorMessage || result.errorCode);
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setProfileImage({
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    fileName: asset.fileName || 'profile.jpg',
                });
            }
        } catch (error) {
            console.warn('Gallery pick error:', error);
            Alert.alert('Error', 'Failed to pick image from gallery.');
        }
    };

    // Take Photo using Camera
    const handleTakePhoto = async () => {
        setImageModalVisible(false);
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
            return;
        }

        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                saveToPhotos: false,
            });

            if (result.didCancel) return;

            if (result.errorCode) {
                Alert.alert('Camera Error', result.errorMessage || result.errorCode);
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setProfileImage({
                    uri: asset.uri,
                    type: asset.type || 'image/jpeg',
                    fileName: asset.fileName || 'profile.jpg',
                });
            }
        } catch (error) {
            console.warn('Camera take photo error:', error);
            Alert.alert('Error', 'Failed to take photo with camera.');
        }
    };

    // Remove Selected Photo
    const handleRemovePhoto = () => {
        setProfileImage(null);
        setImageModalVisible(false);
    };

    // Form Validation & Save
    const handleSaveProfile = async () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Full name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const updatedProfile = {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            profileImage: profileImage, // Selected asset from ImagePicker
        };

        if (updateUser) {
            const result = await updateUser(updatedProfile);

            if (result.success) {
                Alert.alert(
                    'Profile Saved ✅',
                    result.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                if (navigation.canGoBack()) {
                                    navigation.goBack();
                                } else {
                                    navigation.navigate('MainTabs');
                                }
                            },
                        },
                    ]
                );
            } else {
                Alert.alert(
                    'Profile Update Failed ❌',
                    result.message || 'Something went wrong',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                if (navigation.canGoBack()) {
                                    navigation.goBack();
                                }
                            },
                        },
                    ]
                );
            }
        }
    };
    const resolveAvatar = () => {
        if (!profileImage) return personImageDefault;
        if (typeof profileImage === 'string') return { uri: profileImage };
        if (typeof profileImage === 'object') {
            const uri = profileImage.url || profileImage.uri;
            if (uri) return { uri };
        }
        return personImageDefault;
    };

    return (
        <View style={styles.container}>
            {/* Fixed Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('MainTabs');
                        }
                    }}
                >
                    <Back width={16} height={16} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={true}
                    alwaysBounceVertical={true}
                    nestedScrollEnabled={true}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Image Picker (Center) */}
                    <View style={styles.imagePickerSection}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.imageWrapper}
                            onPress={() => setImageModalVisible(true)}
                        >
                            <Image source={resolveAvatar()} style={styles.profileImage} />

                            {/* Camera/Edit Badge Indicator */}
                            <View style={styles.cameraBadge}>
                                <Update width={14} height={14} fill="#FFFFFF" />
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.imageHelperText}>Tap to change photo</Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Full Name <Text style={styles.requiredStar}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.name && styles.inputErrorBorder]}>
                                <User width={18} height={18} fill={theme.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter full name"
                                    placeholderTextColor={theme.textMuted}
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                                    }}
                                    autoCapitalize="words"
                                />
                                {name.length > 0 && (
                                    <TouchableOpacity onPress={() => setName('')} style={styles.clearIcon}>
                                        <Text style={styles.clearText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Email Address <Text style={styles.requiredStar}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.email && styles.inputErrorBorder, styles.emailInput]}>
                                <Mail width={18} height={18} fill={theme.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    editable={false}
                                    placeholder="Enter email address"
                                    placeholderTextColor={theme.textMuted}
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        {/* Phone Number Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Contact Number <Text className='text-sm' style={{ color: theme.textMuted }}>(optional)</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.phone && styles.inputErrorBorder]}>
                                <Phone width={18} height={18} fill={theme.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder='Enter your number'
                                    placeholderTextColor={theme.textMuted}
                                    value={phone}
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/\D/g, '').slice(0, 10);
                                        setPhone(cleaned);
                                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                />
                                {phone.length > 0 && (
                                    <TouchableOpacity onPress={() => setPhone('')} style={styles.clearIcon}>
                                        <Text style={styles.clearText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Save Profile Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            activeOpacity={0.85}
                            onPress={handleSaveProfile}
                        >
                            <Update width={18} height={18} fill="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>Save Profile</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Modal for Image Picker */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={imageModalVisible}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setImageModalVisible(false)}>
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalSheet}>
                                <View style={styles.modalDragIndicator} />
                                <Text style={styles.modalTitle}>Choose Profile Photo</Text>
                                <Text style={styles.modalSubtitle}>Take a photo or pick from your device gallery</Text>

                                <View style={styles.modalOptionsContainer}>
                                    {/* Camera Option */}
                                    <TouchableOpacity style={styles.modalOptionItem} onPress={handleTakePhoto}>
                                        <View style={[styles.modalOptionIconBox, { backgroundColor: '#E0F2FE' }]}>
                                            <Update width={22} height={22} fill={theme.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalOptionLabel}>Take Photo</Text>
                                            <Text style={styles.modalOptionHint}>Capture with camera</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Gallery Option */}
                                    <TouchableOpacity style={styles.modalOptionItem} onPress={handlePickGallery}>
                                        <View style={[styles.modalOptionIconBox, { backgroundColor: '#DCFCE7' }]}>
                                            <PlusBtn width={22} height={22} fill={theme.amountGet} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalOptionLabel}>Choose from Gallery</Text>
                                            <Text style={styles.modalOptionHint}>Select an existing image</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Remove Option (if custom image is picked) */}
                                    {profileImage && (
                                        <TouchableOpacity style={styles.modalOptionItem} onPress={handleRemovePhoto}>
                                            <View style={[styles.modalOptionIconBox, { backgroundColor: '#FFE4E6' }]}>
                                                <Trash width={22} height={22} fill={theme.amountGive} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.modalOptionLabel, { color: theme.amountGive }]}>
                                                    Remove Photo
                                                </Text>
                                                <Text style={styles.modalOptionHint}>Reset to default picture</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setImageModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default EditProfile;

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 100,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.textPrimary,
    },
    headerPlaceholder: {
        width: 40,
        height: 40,
    },
    imagePickerSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    imageWrapper: {
        width: 108,
        height: 108,
        borderRadius: 54,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    profileImage: {
        width: 108,
        height: 108,
        borderRadius: 54,
        borderWidth: 3,
        borderColor: theme.primary,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.primary,
        borderWidth: 2.5,
        borderColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageHelperText: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '600',
        color: theme.primary,
    },
    formContainer: {
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.textPrimary,
        marginBottom: 8,
    },
    requiredStar: {
        color: theme.amountGive,
        fontWeight: 'bold',
    },
    inputWrapper: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        backgroundColor: theme.surface,
        paddingHorizontal: 14,
    },
    emailInput: {
        backgroundColor: theme.surfaceSubtle,
    },
    inputErrorBorder: {
        borderColor: theme.amountGive,
    },
    inputIcon: {
        marginRight: 10,
    },
    countryCodeBadge: {
        backgroundColor: theme.surfaceSubtle,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 10,
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.textPrimary,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: theme.textPrimary,
        paddingVertical: 0,
    },
    clearIcon: {
        padding: 4,
    },
    clearText: {
        fontSize: 14,
        color: theme.textMuted,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 12,
        color: theme.amountGive,
        marginTop: 5,
        marginLeft: 4,
        fontWeight: '500',
    },
    submitButton: {
        height: 54,
        borderRadius: 14,
        backgroundColor: theme.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: theme.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalDragIndicator: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: theme.border,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 13,
        color: theme.textMuted,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalOptionsContainer: {
        gap: 12,
        marginBottom: 20,
    },
    modalOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceSubtle,
        padding: 14,
        borderRadius: 14,
        gap: 14,
    },
    modalOptionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOptionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.textPrimary,
    },
    modalOptionHint: {
        fontSize: 12,
        color: theme.textMuted,
        marginTop: 2,
    },
    modalCancelButton: {
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: theme.surfaceSubtle,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.textSecondary,
    },
});