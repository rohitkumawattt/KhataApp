import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Back, History, Info, Mail, User } from '../assets';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ContactUs = ({ navigation }) => {
    const { theme } = useTheme();
    const { user, BASE_URL, accessToken } = useAuth();
    const styles = getStyles(theme);

    // Form state
    const [name, setName] = useState(user?.name);
    const [email, setEmail] = useState(user?.email);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const handleSendMessage = async () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Please enter your name';
        }

        if (!email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!subject.trim()) {
            newErrors.subject = 'Please enter a subject';
        }

        if (!message.trim()) {
            newErrors.message = 'Please enter your message';
        } else if (message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await axios.post(
                `${BASE_URL}/contact/send`,
                {
                    name: name.trim(),
                    subject: subject.trim(),
                    message: message.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.data.success) {
                Alert.alert(
                    'Message Sent ✅',
                    'Thank you for contacting us! We have received your message and our team will get back to you shortly.',
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
                Alert.alert('Error ❌', response.data.error || response.data.message || 'Could not send message');
            }
        } catch (error) {
            console.error('Send Contact Message Error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Server error, please try again.';
            Alert.alert('Error ❌', errorMsg);
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.headerTitle}>Contact Us</Text>
                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => navigation.navigate('ContactHistory')}
                >
                    <History width={18} height={18} />
                </TouchableOpacity>
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
                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Your Name <Text style={styles.requiredStar}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.name && styles.inputErrorBorder]}>
                                <User width={18} height={18} fill={theme.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your name"
                                    placeholderTextColor={theme.textMuted}
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text);
                                        if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                                    }}
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
                                Your Email <Text style={styles.requiredStar}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.email && styles.inputErrorBorder, styles.emailInput]}>
                                <Mail width={18} height={18} fill={theme.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    editable={false}
                                    placeholder="Enter your email"
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

                        {/* Subject Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Subject <Text style={styles.requiredStar}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.subject && styles.inputErrorBorder]}>
                                <Info width={18} height={18} fill={theme.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. App Issue, Feedback, Query"
                                    placeholderTextColor={theme.textMuted}
                                    value={subject}
                                    onChangeText={(text) => {
                                        setSubject(text);
                                        if (errors.subject) setErrors((prev) => ({ ...prev, subject: null }));
                                    }}
                                />
                                {subject.length > 0 && (
                                    <TouchableOpacity onPress={() => setSubject('')} style={styles.clearIcon}>
                                        <Text style={styles.clearText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
                        </View>

                        {/* Message Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Message <Text style={styles.requiredStar}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.messageInput, errors.message && styles.inputErrorBorder]}
                                placeholder="Describe your issue or suggestions in detail..."
                                placeholderTextColor={theme.textMuted}
                                value={message}
                                onChangeText={(text) => {
                                    setMessage(text);
                                    if (errors.message) setErrors((prev) => ({ ...prev, message: null }));
                                }}
                                multiline
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <View style={styles.messageFooter}>
                                {errors.message ? (
                                    <Text style={styles.errorText}>{errors.message}</Text>
                                ) : <View />}
                                <Text style={styles.characterCount}>{message.length}/500</Text>
                            </View>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity
                            style={styles.sendButton}
                            activeOpacity={0.85}
                            onPress={handleSendMessage}
                        >
                            <Text style={styles.sendButtonText}>Send Message</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ContactUs;

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
    historyButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerPlaceholder: {
        width: 40,
        height: 40,
    },
    formContainer: {
        marginTop: 4,
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
    inputErrorBorder: {
        borderColor: theme.amountGive,
    },
    emailInput: {
        backgroundColor: theme.surfaceSubtle,
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
    messageInput: {
        minHeight: 120,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        backgroundColor: theme.surface,
        padding: 14,
        fontSize: 15,
        color: theme.textPrimary,
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    characterCount: {
        fontSize: 11,
        color: theme.textMuted,
        marginLeft: 'auto',
    },
    errorText: {
        fontSize: 12,
        color: theme.amountGive,
        marginTop: 4,
        marginLeft: 2,
        fontWeight: '500',
    },
    sendButton: {
        height: 54,
        borderRadius: 14,
        backgroundColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});