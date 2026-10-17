import React, { createContext, useContext, useEffect, useState, } from 'react';
import { useColorScheme, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme/Colors';
const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'khata_theme';

export const ThemeProvider = ({ children, }) => {
    const systemTheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('system');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);
    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme) {
                setThemeMode(savedTheme);
            }
        } catch (error) {
            console.log('LOAD THEME ERROR:', error);
        } finally {
            setLoading(false);
        }
    };
    const changeTheme = async (mode) => {
        try {
            setThemeMode(mode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.log('CHANGE THEME ERROR:', error);
        }
    };
    const activeTheme = themeMode === 'system' ? systemTheme || 'light' : themeMode;
    const theme = Colors[activeTheme] || Colors.light;
    return (

        <ThemeContext.Provider value={{ theme, themeMode, activeTheme, changeTheme, isDark: activeTheme === 'dark', loading }}>
            {children}
        </ThemeContext.Provider>

    );
};

export const useTheme = () => {

    const context =
        useContext(ThemeContext);


    if (!context) {

        throw new Error(
            'useTheme must be used inside ThemeProvider'
        );

    }


    return context;
};