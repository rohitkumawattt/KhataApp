import { StyleSheet, View, Platform } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import Person from '../screens/Persons';
import AllAmount from '../screens/AllAmount';
import Profile from '../screens/Profile';
import { useTheme } from '../context/ThemeContext';
import { HomeIcon, Group, User, Rupee } from '../assets/index';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <Tab.Navigator
            sceneContainerStyle={{ backgroundColor: theme.background }}
            screenOptions={({ route }) => ({
                headerShown: false,
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
                tabBarIcon: ({ focused, color }) => {
                    let IconComponent;

                    if (route.name === 'Home') IconComponent = HomeIcon;
                    else if (route.name === 'Person') IconComponent = Group;
                    else if (route.name === 'Entries') IconComponent = Rupee;
                    else if (route.name === 'Profile') IconComponent = User;

                    return (
                        <View style={styles.iconContainer}>
                            {/* Active tab top line indicator */}
                            {focused && (
                                <View style={[styles.activeDot, { backgroundColor: theme.primary }]} />
                            )}
                            {IconComponent && (
                                <IconComponent width={22} height={22} fill={color} />
                            )}
                        </View>
                    );
                },
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
                name="Entries"
                component={AllAmount}
                options={{ tabBarLabel: 'Entries' }}
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
});