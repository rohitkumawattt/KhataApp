import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { Back, Phone, Settings, ThreeDots, Update, UserLogout } from '../assets';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Menu, Divider } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const personImage = require("../assets/images/personImage.png");

const Profile = ({ navigation }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { user, logout } = useAuth();
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out of your Khata account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const profileOptions = [
        {
            id: 1,
            title: 'Contact Us',
            icon: <Phone width={20} height={20} fill={theme.primary} />,
            navigateLink: 'ContactUs',
        },
        {
            id: 2,
            title: 'Settings',
            icon: <Settings width={20} height={20} fill={theme.primary} />,
            navigateLink: 'Settings',
        },
        {
            id: 3,
            title: 'Logout',
            icon: <UserLogout width={20} height={20} fill={theme.amountGive} />,
            color: theme.amountGiveBg,
            textColor: theme.amountGive,
            action: handleLogout,
        },
    ];

    const profileImageUri =
        typeof user?.profileImage === 'string'
            ? user.profileImage
            : user?.profileImage?.url || user?.profileImage?.uri || null;

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="w-full flex-row items-center justify-between p-5">
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            navigation.navigate('MainTabs');
                        }
                    }}
                >
                    <Back width={16} height={16} fill={theme.textPrimary} />
                </TouchableOpacity>

                <Text className="flex-1 text-center text-lg font-bold" style={{ color: theme.textPrimary }}>
                    Profile
                </Text>

                <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={
                        <TouchableOpacity
                            onPress={openMenu}
                            style={[styles.moreButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            activeOpacity={0.7}
                        >
                            <ThreeDots width={18} height={18} fill={theme.textPrimary} />
                        </TouchableOpacity>
                    }
                    contentStyle={{
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: theme.surface,
                        paddingVertical: 6,
                    }}
                >
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            closeMenu();
                            navigation.navigate('EditProfile');
                        }}
                    >
                        <Update width={20} height={20} fill={theme.textPrimary} />
                        <Text style={[styles.menuText, { color: theme.textPrimary }]}>
                            Edit
                        </Text>
                    </TouchableOpacity>

                    <Divider style={{ marginVertical: 4, backgroundColor: theme.border }} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            closeMenu();
                            handleLogout();
                        }}
                    >
                        <UserLogout width={20} height={20} fill={theme.amountGive} />
                        <Text style={[styles.menuText, { color: theme.amountGive }]}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                </Menu>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={true}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 60 }}
            >
                {/* User Profile Header Banner */}
                <LinearGradient
                    colors={[theme.background, theme.primaryLight || '#E0F2FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.userProfileContainer}
                >
                    <Image
                        style={[styles.userProfileImage, { borderColor: theme.border }]}
                        source={profileImageUri ? { uri: profileImageUri } : personImage}
                    />
                    <View>
                        <Text className='text-2xl text-center font-bold' style={{ color: theme.textPrimary }}>
                            {user?.name || '---'}
                        </Text>
                        <Text className='text-md text-center mt-1' style={{ color: theme.textSecondary }}>
                            {user?.email || '-----'}
                        </Text>
                        <Text className='text-sm text-center mt-0.5' style={{ color: theme.textMuted }}>
                            {user?.phone ? '+91 ' + user?.phone : '---'}
                        </Text>
                    </View>
                </LinearGradient>

                {/* Profile Options List */}
                <View style={{ padding: 16, gap: 14 }}>
                    {profileOptions.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="flex-row items-center gap-3 w-full rounded-2xl p-4"
                            onPress={() => {
                                if (item.action) {
                                    item.action();
                                } else if (item.navigateLink) {
                                    navigation.navigate(item.navigateLink);
                                }
                            }}
                            style={[
                                styles.profileOptions,
                                {
                                    backgroundColor: item.color || theme.surface,
                                    borderColor: theme.border,
                                },
                            ]}
                        >
                            <View
                                className="w-10 h-10 rounded-full flex-row items-center justify-center"
                                style={{ backgroundColor: theme.surfaceSubtle }}
                            >
                                {item.icon}
                            </View>
                            <Text
                                className="font-semibold text-base flex-1"
                                style={{ color: item.textColor || theme.textPrimary }}
                            >
                                {item.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default Profile;

const getStyles = (theme) => StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 130,
        height: 44,
        gap: 10,
        paddingHorizontal: 14,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '600',
    },
    userProfileContainer: {
        paddingVertical: 36,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    userProfileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
    },
    profileOptions: {
        borderWidth: 1,
    },
});