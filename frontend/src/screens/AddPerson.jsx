import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
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
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Back, Phone, PlusBtn, Trash, Update, User } from '../assets/index.js';

const AddPerson = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { BASE_URL, accessToken } = useAuth();

    const { person } = route.params || {};
    const isEditMode = !!person;

    // Helper: Extract initial phone digits
    const getInitialPhone = () => {
        if (!person?.phone && !person?.number) return '';
        const num = person.phone || person.number;
        return num.replace(/^\+91\s?/, '').replace(/\D/g, '');
    };

    // Helper: Initial Image URI
    const getInitialImage = () => {
        if (!person?.profileImage) return null;
        if (typeof person.profileImage === 'string') return person.profileImage;
        return person.profileImage.url || null;
    };

    // Form States
    const [selectedImage, setSelectedImage] = useState(null); // Local Asset from ImagePicker
    const [personImageUri, setPersonImageUri] = useState(getInitialImage()); // Display URI
    const [name, setName] = useState(person?.name || '');
    const [phone, setPhone] = useState(getInitialPhone());
    const [address, setAddress] = useState(person?.address || '');

    // UI & API States
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Request Android Camera Permission
    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'KhataApp needs access to your camera to take a photo.',
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

            if (result.didCancel || !result.assets || result.assets.length === 0) return;

            if (result.errorCode) {
                Alert.alert('Gallery Error', result.errorMessage || result.errorCode);
                return;
            }

            const asset = result.assets[0];
            setSelectedImage(asset);
            setPersonImageUri(asset.uri);
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

            if (result.didCancel || !result.assets || result.assets.length === 0) return;

            if (result.errorCode) {
                Alert.alert('Camera Error', result.errorMessage || result.errorCode);
                return;
            }

            const asset = result.assets[0];
            setSelectedImage(asset);
            setPersonImageUri(asset.uri);
        } catch (error) {
            console.warn('Camera capture error:', error);
            Alert.alert('Error', 'Failed to capture photo.');
        }
    };

    // Remove Selected Photo
    const handleRemovePhoto = () => {
        setSelectedImage(null);
        setPersonImageUri(null);
        setImageModalVisible(false);
    };

    // Form Validation & API Submit
    const handleSubmit = async () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = 'Person name is required';
        }
        if (phone.trim() && phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Please enter a valid 10-digit number';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('phone', phone.trim());
            formData.append('address', address.trim());

            // Append Image if new image is selected
            if (selectedImage && selectedImage.uri) {
                formData.append('profileImage', {
                    uri: selectedImage.uri,
                    type: selectedImage.type || 'image/jpeg',
                    name: selectedImage.fileName || 'person.jpg',
                });
            }

            let response;
            if (isEditMode) {
                const personId = person._id || person.id;
                response = await axios.put(`${BASE_URL}/persons/update/${personId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            } else {
                response = await axios.post(`${BASE_URL}/persons/add`, formData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }

            if (response.data.success) {
                Alert.alert(
                    isEditMode ? 'Updated ✅' : 'Success 🎉',
                    response.data.message || (isEditMode ? 'Person updated successfully' : 'Person added successfully'),
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
                Alert.alert('Operation Failed ❌', response.data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Add/Update Person Error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Network error, please try again.';
            Alert.alert('Error ❌', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            if (navigation.canGoBack()) {
                                navigation.goBack();
                            } else {
                                navigation.navigate('welcome');
                            }
                        }}
                    >
                        <Back width={16} height={16} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditMode ? 'Update Person' : 'Add New Person'}</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                {/* Profile Image Picker */}
                <View style={styles.imagePickerSection}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.imageWrapper}
                        onPress={() => setImageModalVisible(true)}
                    >
                        {personImageUri ? (
                            <Image source={{ uri: personImageUri }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <User width={46} height={46} fill={theme.textMuted} />
                            </View>
                        )}

                        <View style={styles.cameraBadge}>
                            <Update width={14} height={14} fill="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.imageHelperText}>
                        {personImageUri ? 'Tap to change photo' : 'Add person photo'}
                    </Text>
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
                                placeholder="Enter full name (e.g. Aman Sharma)"
                                placeholderTextColor={theme.textMuted}
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                                }}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                            {name.length > 0 && !loading && (
                                <TouchableOpacity onPress={() => setName('')} style={styles.clearIcon}>
                                    <Text style={styles.clearText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Phone Number Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Contact Number <Text style={styles.optionalTag}>(Optional)</Text>
                        </Text>
                        <View style={[styles.inputWrapper, errors.phone && styles.inputErrorBorder]}>
                            <Phone width={18} height={18} fill={theme.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="98765 43210"
                                placeholderTextColor={theme.textMuted}
                                value={phone}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/\D/g, '').slice(0, 10);
                                    setPhone(cleaned);
                                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                                }}
                                keyboardType="number-pad"
                                maxLength={10}
                                editable={!loading}
                            />
                            {phone.length > 0 && !loading && (
                                <TouchableOpacity onPress={() => setPhone('')} style={styles.clearIcon}>
                                    <Text style={styles.clearText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                    </View>

                    {/* Address Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Address / Notes <Text style={styles.optionalTag}>(Optional)</Text>
                        </Text>
                        <TextInput
                            style={styles.addressInput}
                            placeholder="Shop / Area / City or reference notes..."
                            placeholderTextColor={theme.textMuted}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            textAlignVertical="top"
                            maxLength={150}
                            editable={!loading}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && { opacity: 0.7 }]}
                        activeOpacity={0.85}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                {isEditMode ? (
                                    <Update width={18} height={18} fill="#FFFFFF" style={{ marginRight: 8 }} />
                                ) : (
                                    <PlusBtn width={18} height={18} fill="#FFFFFF" style={{ marginRight: 8 }} />
                                )}
                                <Text style={styles.submitButtonText}>{isEditMode ? 'Save Person' : 'Add Person'}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
                                    <TouchableOpacity style={styles.modalOptionItem} onPress={handleTakePhoto}>
                                        <View style={[styles.modalOptionIconBox, { backgroundColor: '#E0F2FE' }]}>
                                            <Update width={22} height={22} fill={theme.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalOptionLabel}>Take Photo</Text>
                                            <Text style={styles.modalOptionHint}>Capture with camera</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.modalOptionItem} onPress={handlePickGallery}>
                                        <View style={[styles.modalOptionIconBox, { backgroundColor: '#DCFCE7' }]}>
                                            <PlusBtn width={22} height={22} fill={theme.amountGet} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalOptionLabel}>Choose from Gallery</Text>
                                            <Text style={styles.modalOptionHint}>Select an existing image</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {personImageUri && (
                                        <TouchableOpacity style={styles.modalOptionItem} onPress={handleRemovePhoto}>
                                            <View style={[styles.modalOptionIconBox, { backgroundColor: '#FFE4E6' }]}>
                                                <Trash width={22} height={22} fill={theme.amountGive} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.modalOptionLabel, { color: theme.amountGive }]}>
                                                    Remove Photo
                                                </Text>
                                                <Text style={styles.modalOptionHint}>Delete current picture</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>

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
        </KeyboardAvoidingView>
    );
};

export default AddPerson;

const getStyles = (theme) => StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
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
    imagePlaceholder: {
        width: 108,
        height: 108,
        borderRadius: 54,
        backgroundColor: theme.surface,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
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
    optionalTag: {
        fontSize: 12,
        fontWeight: 'normal',
        color: theme.textMuted,
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
    inputErrorBorder: {
        borderColor: theme.amountGive,
    },
    inputIcon: {
        marginRight: 10,
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
    addressInput: {
        minHeight: 80,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        backgroundColor: theme.surface,
        padding: 14,
        fontSize: 14,
        color: theme.textPrimary,
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
    },
    modalSubtitle: {
        fontSize: 13,
        color: theme.textMuted,
        textAlign: 'center',
        marginTop: 4,
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
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
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
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.surfaceSubtle,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.textSecondary,
    },
});