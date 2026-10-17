import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { Menu, Divider } from 'react-native-paper';
import { ThreeDots, Update, Trash } from '../assets';
import { useTheme } from '../context/ThemeContext';

const PersonMenu = ({ item, navigation }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
                <TouchableOpacity
                    onPress={openMenu}
                    style={styles.anchorButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    activeOpacity={0.7}
                >
                    <ThreeDots width={18} height={18} />
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
                    navigation.navigate('AddPerson', {
                        person: item,
                    });
                }}
            >
                <Update width={20} height={20} />
                <Text style={styles.menuText}>Update</Text>
            </TouchableOpacity>

            <Divider style={{ marginVertical: 4, backgroundColor: theme.border }} />

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    closeMenu();
                    Alert.alert(
                        'Delete Person',
                        `Are you sure you want to delete ${item?.name || 'this person'} and their transaction history?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => {
                                    Alert.alert('Deleted', `${item?.name || 'Person'} deleted successfully.`);
                                },
                            },
                        ]
                    );
                }}
            >
                <Trash width={20} height={20} fill={theme.amountGive} />
                <Text style={[styles.menuText, { color: theme.amountGive }]}>Delete</Text>
            </TouchableOpacity>
        </Menu>
    );
};

export default PersonMenu;

const getStyles = (theme) => StyleSheet.create({
    anchorButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
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
        color: theme.textPrimary,
    },
});