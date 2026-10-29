import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {
    Back,
    Backup,
    Bell,
    Eye,
    EyeCrossed,
    Help,
    Info,
    Lock,
    Phone,
    Right,
    Rupee,
    Settings as SettingsIcon,
    Trash,
    Update,
} from '../assets';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Available Currencies
const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
];

// Available Date Formats
const DATE_FORMATS = [
    { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 28/09/2026)' },
    { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 09/28/2026)' },
    { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-09-28)' },
    { id: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g. 28 Sep 2026)' },
];

const Settings = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { theme, themeMode, changeTheme } = useTheme();
    const { BASE_URL, accessToken } = useAuth();
    const [passwordLoading, setPasswordLoading] = useState(false);
    const styles = getStyles(theme);

    // App Settings States
    const [currency, setCurrency] = useState(CURRENCIES[0]);
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [lastBackupTime, setLastBackupTime] = useState('28 Sep 2026, 08:30 PM');
    const [isBackingUp, setIsBackingUp] = useState(false);

    // Modal Visibility States
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [dateFormatModalVisible, setDateFormatModalVisible] = useState(false);
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);

    // Password Form States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({});

    // Backup Action
    const handleBackupNow = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            setIsBackingUp(false);
            const now = new Date();
            const formatted = `${now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            setLastBackupTime(formatted);
            Alert.alert(
                'Cloud Backup Complete ☁️',
                'All your Khata records, transactions, and customers are safely backed up.'
            );
        }, 1200);
    };

    // Restore Action
    const handleRestoreData = () => {
        Alert.alert(
            'Restore Data',
            'Do you want to restore data from your latest cloud backup? This will sync your existing entries.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Restore Now',
                    onPress: () => {
                        Alert.alert('Data Restored ✅', 'All customer accounts and transactions have been synced.');
                    },
                },
            ]
        );
    };

    // Export Data Action
    const handleExport = (type) => {
        setExportModalVisible(false);
        Alert.alert(
            'Export Successful 📄',
            `Your complete Khata report has been exported as ${type} and saved to your device downloads.`
        );
    };

    // Change Password Submit
    const handlePasswordChange = async () => {
        const errors = {};
        if (!currentPassword.trim()) {
            errors.current = 'Current password is required';
        }
        if (!newPassword.trim()) {
            errors.newPass = 'New password is required';
        } else if (newPassword.trim().length < 6) {
            errors.newPass = 'Must be at least 6 characters';
        }
        if (!confirmPassword.trim()) {
            errors.confirm = 'Please confirm your new password';
        } else if (newPassword !== confirmPassword) {
            errors.confirm = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setPasswordErrors({});
        setPasswordLoading(true);

        try {
            const response = await axios.post(
                `${BASE_URL}/auth/change-password`,
                {
                    currentPassword: currentPassword.trim(),
                    newPassword: newPassword.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.data.success) {
                setPasswordModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                Alert.alert('Security Updated 🔒', 'Your password has been changed successfully.');
            } else {
                Alert.alert('Failed ❌', response.data.message || 'Could not change password');
            }
        } catch (error) {
            console.error('Change Password Error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || 'Server error, please try again.';
            Alert.alert('Error ❌', errorMsg);
        } finally {
            setPasswordLoading(false);
        }
    };

    // Clear Cache / Reset App
    const handleResetData = () => {
        Alert.alert(
            '⚠️ Reset All Data',
            'Are you sure you want to clear local cache and reset app data? Make sure you have backed up your data first.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Cache',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Cache Cleared 🧹', 'Temporary app cache has been cleared successfully.');
                    },
                },
            ]
        );
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
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Scrollable Settings Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={true}
                alwaysBounceVertical={true}
                nestedScrollEnabled={true}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. APPEARANCE SECTION */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Appearance & Display</Text>
                    <View style={styles.cardGroup}>
                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={() => setThemeModalVisible(true)}
                        >
                            <View style={[styles.iconBox]}>
                                <SettingsIcon width={20} height={20} />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Theme</Text>
                            </View>
                            <Right width={16} height={16} fill={theme.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Inline Segmented Theme Selector for Fast Access */}
                        <View style={styles.segmentedThemeContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.themeChip,
                                    themeMode === 'system' && styles.themeChipActive,
                                ]}
                                onPress={() => changeTheme('system')}
                            >
                                <Text
                                    style={[
                                        styles.themeChipText,
                                        themeMode === 'system' && styles.themeChipTextActive,
                                    ]}
                                >
                                    ⚙️ System
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.themeChip,
                                    themeMode === 'light' && styles.themeChipActive,
                                ]}
                                onPress={() => changeTheme('light')}
                            >
                                <Text
                                    style={[
                                        styles.themeChipText,
                                        themeMode === 'light' && styles.themeChipTextActive,
                                    ]}
                                >
                                    ☀️ Light
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.themeChip,
                                    themeMode === 'dark' && styles.themeChipActive,
                                ]}
                                onPress={() => changeTheme('dark')}
                            >
                                <Text
                                    style={[
                                        styles.themeChipText,
                                        themeMode === 'dark' && styles.themeChipTextActive,
                                    ]}
                                >
                                    🌙 Dark
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 2. SECURITY SECTION */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Security & Privacy</Text>
                    <View style={styles.cardGroup}>
                        {/* Change Password / PIN */}
                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={() => {
                                setPasswordErrors({});
                                setPasswordModalVisible(true);
                            }}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#EDE9FE' }]}>
                                <Lock width={20} height={20} fill="#7C3AED" />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Change Password / PIN</Text>
                                <Text style={styles.settingSubtitle}>Update your app lock credentials</Text>
                            </View>
                            <Right width={16} height={16} fill={theme.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. BACKUP & EXPORT SECTION */}
                {/* <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Data Backup & Export</Text>
                    <View style={styles.cardGroup}>
                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={handleBackupNow}
                            disabled={isBackingUp}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                                <Backup width={20} height={20} fill={theme.primary} />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>
                                    {isBackingUp ? 'Backing up data...' : 'Cloud Backup'}
                                </Text>
                                <Text style={styles.settingSubtitle}>Last: {lastBackupTime}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.actionChip}
                                onPress={handleBackupNow}
                                disabled={isBackingUp}
                            >
                                <Text style={styles.actionChipText}>
                                    {isBackingUp ? 'Saving...' : 'Backup Now'}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={handleRestoreData}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                                <Update width={20} height={20} fill="#D97706" />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Restore Data</Text>
                                <Text style={styles.settingSubtitle}>Sync entries from cloud storage</Text>
                            </View>
                            <Right width={16} height={16} fill={theme.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={() => setExportModalVisible(true)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#FCE7F3' }]}>
                                <Info width={20} height={20} fill="#DB2777" />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Export Khata Data</Text>
                                <Text style={styles.settingSubtitle}>Download as PDF, Excel, or CSV</Text>
                            </View>
                            <Right width={16} height={16} fill={theme.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View> */}

                {/* 4. PREFERENCES (CURRENCY & DATE TIME) */}
                {/* <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Preferences</Text>
                    <View style={styles.cardGroup}>
                       
                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={() => setCurrencyModalVisible(true)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                                <Rupee width={20} height={20} fill={theme.amountGet} />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Currency</Text>
                                <Text style={styles.settingSubtitle}>
                                    {currency.name} ({currency.symbol})
                                </Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{currency.code}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={() => setDateFormatModalVisible(true)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                                <Help width={20} height={20} fill={theme.primary} />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Date Format</Text>
                                <Text style={styles.settingSubtitle}>{dateFormat}</Text>
                            </View>
                            <Right width={16} height={16} fill={theme.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View> */}

                {/* 5. SUPPORT & ABOUT */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Support & About</Text>
                    <View style={styles.cardGroup}>
                        {/* Contact Us */}
                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ContactUs')}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                                <Phone width={20} height={20} fill={theme.primary} />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>Contact Support</Text>
                                <Text style={styles.settingSubtitle}>Send queries or feedback</Text>
                            </View>
                            <Right width={16} height={16} fill={theme.textMuted} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* About Us */}
                        <TouchableOpacity
                            style={styles.settingItem}
                            activeOpacity={0.7}
                            onPress={() => setAboutModalVisible(true)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                                <Info width={20} height={20} fill={theme.textPrimary} />
                            </View>
                            <View style={styles.settingTextContainer}>
                                <Text style={styles.settingTitle}>About Khata</Text>
                                <Text style={styles.settingSubtitle}>Version 2.0.0 • Terms & Privacy</Text>
                            </View>
                            <Right width={16} height={16} fill={theme.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* App Version Footer */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerBrand}>KhataApp</Text>
                    <Text style={styles.footerVersion}>Version 2.0.0</Text>
                    {/* <Text style={styles.footerCopyright}>100% Safe & Secure Cloud Ledger</Text> */}
                </View>
            </ScrollView>

            {/* ================================================= */}
            {/* MODAL 1: THEME SELECTION */}
            {/* ================================================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={themeModalVisible}
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setThemeModalVisible(false)}>
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalSheet}>
                                <View style={styles.modalDragIndicator} />
                                <Text style={styles.modalTitle}>Choose App Theme</Text>
                                <Text style={styles.modalSubtitle}>Select your visual preference</Text>

                                <View style={styles.modalOptionsContainer}>
                                    {[
                                        { id: 'system', label: 'System Default', desc: 'Match your device settings', icon: '⚙️' },
                                        { id: 'light', label: 'Light Mode', desc: 'Clean, high-contrast white theme', icon: '☀️' },
                                        { id: 'dark', label: 'Dark Mode', desc: 'Easy on the eyes in low light', icon: '🌙' },
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            style={[
                                                styles.modalSelectionItem,
                                                themeMode === option.id && styles.modalSelectionItemActive,
                                            ]}
                                            onPress={() => {
                                                changeTheme(option.id);
                                                setThemeModalVisible(false);
                                            }}
                                        >
                                            <Text style={{ fontSize: 24, marginRight: 12 }}>{option.icon}</Text>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.modalOptionLabel}>{option.label}</Text>
                                                <Text style={styles.modalOptionHint}>{option.desc}</Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.radioOuter,
                                                    themeMode === option.id && styles.radioOuterActive,
                                                ]}
                                            >
                                                {themeMode === option.id && <View style={styles.radioInner} />}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setThemeModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ================================================= */}
            {/* MODAL 2: CHANGE PASSWORD / PIN */}
            {/* ================================================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={passwordModalVisible}
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setPasswordModalVisible(false)}>
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <TouchableWithoutFeedback>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={{ width: '100%' }}
                            >
                                <View style={styles.modalSheet}>
                                    <View style={styles.modalDragIndicator} />
                                    <Text style={styles.modalTitle}>Change Password / PIN</Text>
                                    <Text style={styles.modalSubtitle}>
                                        Keep your financial ledger protected
                                    </Text>

                                    {/* Current Password */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Current Password / PIN</Text>
                                        <View
                                            style={[
                                                styles.inputWrapper,
                                                passwordErrors.current && styles.inputErrorBorder,
                                            ]}
                                        >
                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="Enter current password"
                                                placeholderTextColor={theme.textMuted}
                                                secureTextEntry={!showCurrentPass}
                                                value={currentPassword}
                                                onChangeText={(val) => {
                                                    setCurrentPassword(val);
                                                    if (passwordErrors.current)
                                                        setPasswordErrors((prev) => ({ ...prev, current: null }));
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowCurrentPass(!showCurrentPass)}
                                                style={styles.eyeButton}
                                            >
                                                {showCurrentPass ? (
                                                    <EyeCrossed width={18} height={18} fill={theme.textMuted} />
                                                ) : (
                                                    <Eye width={18} height={18} fill={theme.textMuted} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                        {passwordErrors.current && (
                                            <Text style={styles.errorText}>{passwordErrors.current}</Text>
                                        )}
                                    </View>

                                    {/* New Password */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>New Password / PIN</Text>
                                        <View
                                            style={[
                                                styles.inputWrapper,
                                                passwordErrors.newPass && styles.inputErrorBorder,
                                            ]}
                                        >
                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="Enter new password (min 4 chars)"
                                                placeholderTextColor={theme.textMuted}
                                                secureTextEntry={!showNewPass}
                                                value={newPassword}
                                                onChangeText={(val) => {
                                                    setNewPassword(val);
                                                    if (passwordErrors.newPass)
                                                        setPasswordErrors((prev) => ({ ...prev, newPass: null }));
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowNewPass(!showNewPass)}
                                                style={styles.eyeButton}
                                            >
                                                {showNewPass ? (
                                                    <EyeCrossed width={18} height={18} fill={theme.textMuted} />
                                                ) : (
                                                    <Eye width={18} height={18} fill={theme.textMuted} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                        {passwordErrors.newPass && (
                                            <Text style={styles.errorText}>{passwordErrors.newPass}</Text>
                                        )}
                                    </View>

                                    {/* Confirm New Password */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                                        <View
                                            style={[
                                                styles.inputWrapper,
                                                passwordErrors.confirm && styles.inputErrorBorder,
                                            ]}
                                        >
                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="Re-enter new password"
                                                placeholderTextColor={theme.textMuted}
                                                secureTextEntry={!showConfirmPass}
                                                value={confirmPassword}
                                                onChangeText={(val) => {
                                                    setConfirmPassword(val);
                                                    if (passwordErrors.confirm)
                                                        setPasswordErrors((prev) => ({ ...prev, confirm: null }));
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => setShowConfirmPass(!showConfirmPass)}
                                                style={styles.eyeButton}
                                            >
                                                {showConfirmPass ? (
                                                    <EyeCrossed width={18} height={18} fill={theme.textMuted} />
                                                ) : (
                                                    <Eye width={18} height={18} fill={theme.textMuted} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                        {passwordErrors.confirm && (
                                            <Text style={styles.errorText}>{passwordErrors.confirm}</Text>
                                        )}
                                    </View>

                                    {/* Save Button */}
                                    <TouchableOpacity
                                        style={styles.modalPrimaryButton}
                                        activeOpacity={0.85}
                                        onPress={handlePasswordChange}
                                    >
                                        <Text style={styles.modalPrimaryButtonText}>Update Password</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={() => setPasswordModalVisible(false)}
                                    >
                                        <Text style={styles.modalCancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ================================================= */}
            {/* MODAL 3: CURRENCY SELECTION */}
            {/* ================================================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={currencyModalVisible}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setCurrencyModalVisible(false)}>
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalSheet}>
                                <View style={styles.modalDragIndicator} />
                                <Text style={styles.modalTitle}>Select Currency</Text>
                                <Text style={styles.modalSubtitle}>
                                    Choose the currency symbol for your transactions
                                </Text>

                                <ScrollView
                                    style={{ maxHeight: 320 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.modalOptionsContainer}>
                                        {CURRENCIES.map((curr) => (
                                            <TouchableOpacity
                                                key={curr.code}
                                                style={[
                                                    styles.modalSelectionItem,
                                                    currency.code === curr.code && styles.modalSelectionItemActive,
                                                ]}
                                                onPress={() => {
                                                    setCurrency(curr);
                                                    setCurrencyModalVisible(false);
                                                }}
                                            >
                                                <View style={styles.currencySymbolBadge}>
                                                    <Text style={styles.currencySymbolText}>{curr.symbol}</Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.modalOptionLabel}>{curr.name}</Text>
                                                    <Text style={styles.modalOptionHint}>{curr.code}</Text>
                                                </View>
                                                <View
                                                    style={[
                                                        styles.radioOuter,
                                                        currency.code === curr.code && styles.radioOuterActive,
                                                    ]}
                                                >
                                                    {currency.code === curr.code && <View style={styles.radioInner} />}
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>

                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setCurrencyModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ================================================= */}
            {/* MODAL 4: DATE FORMAT SELECTION */}
            {/* ================================================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={dateFormatModalVisible}
                onRequestClose={() => setDateFormatModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDateFormatModalVisible(false)}>
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalSheet}>
                                <View style={styles.modalDragIndicator} />
                                <Text style={styles.modalTitle}>Date Format</Text>
                                <Text style={styles.modalSubtitle}>
                                    Select how transaction dates should be displayed
                                </Text>

                                <View style={styles.modalOptionsContainer}>
                                    {DATE_FORMATS.map((df) => (
                                        <TouchableOpacity
                                            key={df.id}
                                            style={[
                                                styles.modalSelectionItem,
                                                dateFormat === df.id && styles.modalSelectionItemActive,
                                            ]}
                                            onPress={() => {
                                                setDateFormat(df.id);
                                                setDateFormatModalVisible(false);
                                            }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.modalOptionLabel}>{df.id}</Text>
                                                <Text style={styles.modalOptionHint}>{df.label}</Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.radioOuter,
                                                    dateFormat === df.id && styles.radioOuterActive,
                                                ]}
                                            >
                                                {dateFormat === df.id && <View style={styles.radioInner} />}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setDateFormatModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ================================================= */}
            {/* MODAL 5: EXPORT DATA MODAL */}
            {/* ================================================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={exportModalVisible}
                onRequestClose={() => setExportModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setExportModalVisible(false)}>
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalSheet}>
                                <View style={styles.modalDragIndicator} />
                                <Text style={styles.modalTitle}>Export Khata Records</Text>
                                <Text style={styles.modalSubtitle}>
                                    Select a format to download your full ledger report
                                </Text>

                                <View style={styles.modalOptionsContainer}>
                                    <TouchableOpacity
                                        style={styles.modalSelectionItem}
                                        onPress={() => handleExport('PDF Document (.pdf)')}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#FFE4E6' }]}>
                                            <Text style={{ fontSize: 18 }}>📄</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalOptionLabel}>PDF Report</Text>
                                            <Text style={styles.modalOptionHint}>Printable ledger with summaries</Text>
                                        </View>
                                        <Right width={16} height={16} fill={theme.textMuted} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalSelectionItem}
                                        onPress={() => handleExport('Excel Spreadsheet (.xlsx)')}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                                            <Text style={{ fontSize: 18 }}>📊</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalOptionLabel}>Excel (.xlsx)</Text>
                                            <Text style={styles.modalOptionHint}>Full table with customer sheets</Text>
                                        </View>
                                        <Right width={16} height={16} fill={theme.textMuted} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.modalSelectionItem}
                                        onPress={() => handleExport('CSV File (.csv)')}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                                            <Text style={{ fontSize: 18 }}>📋</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalOptionLabel}>CSV Format</Text>
                                            <Text style={styles.modalOptionHint}>Raw data for accounting software</Text>
                                        </View>
                                        <Right width={16} height={16} fill={theme.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setExportModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* ================================================= */}
            {/* MODAL 6: ABOUT US & LEGAL */}
            {/* ================================================= */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={aboutModalVisible}
                onRequestClose={() => setAboutModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setAboutModalVisible(false)}>
                    <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalSheet}>
                                <View style={styles.modalDragIndicator} />
                                <Text style={styles.modalTitle}>About Khata</Text>
                                <Text style={styles.modalSubtitle}>Simple, Fast & Secure Digital Ledger</Text>

                                <View style={styles.aboutCard}>
                                    <Text style={styles.aboutText}>
                                        KhataApp replaces your traditional Udhar Bahi Khata with a modern digital ledger book. Manage credit, customer accounts
                                    </Text>
                                    {/* <Text style={styles.aboutText}>
                                        KhataApp replaces your traditional Udhar Bahi Khata with a modern digital ledger book. Manage credit, customer accounts, and automated payment reminders securely in the cloud.
                                    </Text> */}
                                    <View style={styles.aboutMetaRow}>
                                        <Text style={styles.aboutMetaLabel}>Version:</Text>
                                        <Text style={styles.aboutMetaValue}>2.0.0</Text>
                                    </View>
                                    <View style={styles.aboutMetaRow}>
                                        <Text style={styles.aboutMetaLabel}>Developer:</Text>
                                        <Text style={styles.aboutMetaValue}>Rohit Kumawat</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.modalCancelButton}
                                    onPress={() => setAboutModalVisible(false)}
                                >
                                    <Text style={styles.modalCancelText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default Settings;

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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 100,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        color: theme.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    cardGroup: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    settingTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.textPrimary,
    },
    settingSubtitle: {
        fontSize: 12,
        color: theme.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: theme.border,
        marginLeft: 68,
    },
    segmentedThemeContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: theme.surfaceSubtle,
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 12,
        gap: 6,
    },
    themeChip: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeChipActive: {
        backgroundColor: theme.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    themeChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.textSecondary,
    },
    themeChipTextActive: {
        color: theme.primary,
        fontWeight: '700',
    },
    actionChip: {
        backgroundColor: theme.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.primary,
    },
    badge: {
        backgroundColor: theme.surfaceSubtle,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.textPrimary,
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    footerBrand: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.textSecondary,
    },
    footerVersion: {
        fontSize: 12,
        color: theme.textMuted,
        marginTop: 2,
    },
    footerCopyright: {
        fontSize: 11,
        color: theme.textMuted,
        marginTop: 4,
    },
    // Modals
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
        marginBottom: 18,
    },
    modalOptionsContainer: {
        gap: 10,
        marginBottom: 16,
    },
    modalSelectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceSubtle,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    modalSelectionItemActive: {
        borderColor: theme.primary,
        backgroundColor: theme.primaryLight,
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
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterActive: {
        borderColor: theme.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.primary,
    },
    currencySymbolBadge: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },
    currencySymbolText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.textPrimary,
    },
    modalCancelButton: {
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: theme.surfaceSubtle,
        alignItems: 'center',
        marginTop: 4,
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.textSecondary,
    },
    modalPrimaryButton: {
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: theme.primary,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    modalPrimaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.textPrimary,
        marginBottom: 6,
    },
    inputWrapper: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        backgroundColor: theme.surfaceSubtle,
        paddingHorizontal: 12,
    },
    inputErrorBorder: {
        borderColor: theme.amountGive,
    },
    modalInput: {
        flex: 1,
        fontSize: 15,
        color: theme.textPrimary,
        paddingVertical: 0,
    },
    eyeButton: {
        padding: 6,
    },
    errorText: {
        fontSize: 12,
        color: theme.amountGive,
        marginTop: 4,
        marginLeft: 2,
    },
    aboutCard: {
        backgroundColor: theme.surfaceSubtle,
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
    },
    aboutText: {
        fontSize: 13,
        color: theme.textSecondary,
        lineHeight: 20,
        marginBottom: 14,
    },
    aboutMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    aboutMetaLabel: {
        fontSize: 12,
        color: theme.textMuted,
    },
    aboutMetaValue: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.textPrimary,
    },
});