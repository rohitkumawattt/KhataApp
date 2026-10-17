import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Menu, Divider } from 'react-native-paper';
import { Filter } from '../assets';
import { useTheme } from '../context/ThemeContext';

const PersonFilter = ({ selectedFilter = 'all', onSelectFilter }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleSelect = (filterType) => {
        if (onSelectFilter) {
            onSelectFilter(filterType);
        }
        closeMenu();
    };

    const isFilterActive = selectedFilter && selectedFilter !== 'all';

    return (
        <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
                <TouchableOpacity
                    onPress={openMenu}
                    style={styles.filterButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.7}
                >
                    <Filter
                        width={18}
                        height={18}
                        fill={isFilterActive ? theme.primary : theme.textSecondary}
                    />
                </TouchableOpacity>
            }
            contentStyle={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                paddingVertical: 4,
            }}
        >
            <TouchableOpacity
                style={[styles.menuItem, selectedFilter === 'all' && styles.activeMenuItem]}
                onPress={() => handleSelect('all')}
            >
                <Text style={[styles.menuText, selectedFilter === 'all' && styles.activeMenuText]}>
                    All
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, selectedFilter === 'asc' && styles.activeMenuItem]}
                onPress={() => handleSelect('asc')}
            >
                <Text style={[styles.menuText, selectedFilter === 'asc' && styles.activeMenuText]}>
                    A to Z (Ascending)
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, selectedFilter === 'desc' && styles.activeMenuItem]}
                onPress={() => handleSelect('desc')}
            >
                <Text style={[styles.menuText, selectedFilter === 'desc' && styles.activeMenuText]}>
                    Z to A (Descending)
                </Text>
            </TouchableOpacity>

            <Divider style={{ marginVertical: 4, backgroundColor: theme.border }} />

            <TouchableOpacity
                style={[styles.menuItem, selectedFilter === 'get' && styles.activeMenuItem]}
                onPress={() => handleSelect('get')}
            >
                <Text style={[styles.menuText, { color: theme.amountGet }, selectedFilter === 'get' && styles.activeBold]}>
                    You'll get
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, selectedFilter === 'give' && styles.activeMenuItem]}
                onPress={() => handleSelect('give')}
            >
                <Text style={[styles.menuText, { color: theme.amountGive }, selectedFilter === 'give' && styles.activeBold]}>
                    You'll give
                </Text>
            </TouchableOpacity>
        </Menu>
    );
};

export default PersonFilter;

const getStyles = (theme) => StyleSheet.create({
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 150,
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    activeMenuItem: {
        backgroundColor: theme.surfaceSubtle,
    },
    menuText: {
        fontSize: 14,
        color: theme.textPrimary,
        fontWeight: '500',
    },
    activeMenuText: {
        color: theme.primary,
        fontWeight: '700',
    },
    activeBold: {
        fontWeight: '700',
    },
});