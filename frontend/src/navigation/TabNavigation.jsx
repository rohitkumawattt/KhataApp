import { StyleSheet, View, Platform, TouchableOpacity, Animated } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Home from '../screens/Home';
import Person from '../screens/Persons';

import SettledEntries from "../screens/SettledEntries"
import Profile from '../screens/Profile';
import AddEntry from '../screens/AddEntry';
import { useTheme } from '../context/ThemeContext';
import { HomeIcon, Group, User, Rupee, PlusBtn } from '../assets/index';

const Tab = createBottomTabNavigator();

const FloatingAddButton = (props) => {
    const { onPress, onLongPress, accessibilityState } = props;
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const isFocused = accessibilityState?.selected;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(rotateAnim, {
            toValue: isFocused ? 1 : 0,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [isFocused, rotateAnim]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = (e) => {
        if (isFocused) {
            // Tactile pulse animation when already focused
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.12,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        }
        if (onPress) {
            onPress(e);
        }
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    return (
        <View style={styles.floatingContainer} pointerEvents="box-none">
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                onLongPress={onLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityRole="button"
                accessibilityLabel="Add Entry"
                accessibilityState={accessibilityState}
                style={[
                    styles.floatingOuter,
                    isFocused && styles.floatingOuterFocused,
                    {
                        backgroundColor: theme.surface,
                        borderColor: isFocused ? theme.primary : theme.border,
                        shadowColor: theme.primary,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.floatingInnerWrapper,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[
                            theme.primary,
                            theme.primaryHover || theme.primary,
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.floatingGradient}
                    >
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <PlusBtn width={22} height={22} fill="#FFFFFF" />
                        </Animated.View>
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const TabBarIcon = ({ route, focused, color, theme, styles }) => {
    let IconComponent;

    if (route.name === 'Home') IconComponent = HomeIcon;
    else if (route.name === 'Person') IconComponent = Group;
    else if (route.name === 'Settled') IconComponent = Rupee;
    else if (route.name === 'Profile') IconComponent = User;

    if (!IconComponent) return null;

    return (
        <View style={styles.iconContainer}>
            {/* Active tab top line indicator */}
            {focused && (
                <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
            )}
            <IconComponent width={22} height={22} fill={color} />
        </View>
    );
};

const TabNavigation = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: theme.background }}
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: theme.iconActive,
                tabBarInactiveTintColor: theme.icon,
                tabBarLabelStyle: styles.labelStyle,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        backgroundColor: theme.surface,
                        borderTopColor: theme.border,
                    },
                ],
                // eslint-disable-next-line react/no-unstable-nested-components
                tabBarIcon: ({ focused, color }) => (
                    <TabBarIcon
                        route={route}
                        focused={focused}
                        color={color}
                        theme={theme}
                        styles={styles}
                    />
                ),
            })}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Person"
                component={Person}
                options={{ tabBarLabel: 'Persons' }}
            />
            <Tab.Screen
                name="AddEntry"
                component={AddEntry}
                options={{
                    tabBarLabel: () => null,
                    tabBarButton: FloatingAddButton,
                }}
            />
            <Tab.Screen
                name="Settled"
                component={SettledEntries}
                options={{ tabBarLabel: 'Settled' }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigation;

const getStyles = (theme) => StyleSheet.create({
    tabBar: {
        height: Platform.OS === 'ios' ? 84 : 64,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        borderTopWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        overflow: 'visible',
    },
    labelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDot: {
        width: 14,
        height: 3,
        borderRadius: 2,
        position: 'absolute',
        top: -6,
    },
    floatingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        zIndex: 10,
    },
    floatingOuter: {
        top: -18,
        width: 58,
        height: 58,
        borderRadius: 29,
        padding: 4,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        shadowOpacity: 0.25,
        elevation: 7,
    },
    floatingOuterFocused: {
        shadowOpacity: 0.45,
        elevation: 10,
    },
    floatingInnerWrapper: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingGradient: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
});