import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Back } from '../assets';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ContactHistory = ({ navigation }) => {
    const { theme } = useTheme();
    const { BASE_URL, accessToken } = useAuth();
    const styles = getStyles(theme);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [contacts, setContacts] = useState([]);

    // Fetch User Contact Messages
    const fetchContactMsg = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/contact/messages`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Cache-Control': 'no-cache',
                },
            });

            if (response.data.success) {
                setContacts(response.data.userCont || []);
            }
        } catch (error) {
            console.error('CONTACT MSG API ERROR:', error?.response?.data || error.message);
            const errorMsg = error?.response?.data?.message || 'Failed to fetch contact history.';
            Alert.alert('Error ❌', errorMsg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [BASE_URL, accessToken]);

    useFocusEffect(
        useCallback(() => {
            fetchContactMsg();
        }, [fetchContactMsg])
    );

    // Pull-to-Refresh Handler
    const handleRefresh = () => {
        setRefreshing(true);
        fetchContactMsg(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
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
                <Text style={styles.headerTitle}>Contact History</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* List / Loader */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={contacts}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => (item._id ? item._id.toString() : item.id.toString())}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                    contentContainerStyle={
                        contacts.length === 0
                            ? styles.emptyContainer
                            : { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 80 }
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No Contact History</Text>
                            <Text style={styles.emptySubtitle}>
                                You haven't sent any support or inquiry messages yet.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.card}>
                                {/* Subject & Date Row */}
                                <View style={styles.cardHeader}>
                                    <Text style={styles.subjectText} numberOfLines={1}>
                                        {item.subject || 'No Subject'}
                                    </Text>
                                    <Text style={styles.dateBadge}>
                                        {formatDate(item.createdAt || item.date)}
                                    </Text>
                                </View>

                                {/* Sender Info */}
                                <Text style={styles.senderInfo}>
                                    From: <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{item.name}</Text>
                                </Text>

                                {/* Message Body */}
                                <Text style={styles.messageBody}>
                                    {item.message}
                                </Text>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

export default ContactHistory;

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
        fontWeight: '700',
        color: theme.textPrimary,
    },
    headerPlaceholder: {
        width: 40,
        height: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    subjectText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: theme.textPrimary,
        marginRight: 10,
    },
    dateBadge: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.textMuted,
        backgroundColor: theme.surfaceSubtle,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    senderInfo: {
        fontSize: 12,
        color: theme.textSecondary,
        marginBottom: 8,
    },
    messageBody: {
        fontSize: 13,
        color: theme.textSecondary,
        lineHeight: 19,
        backgroundColor: theme.surfaceSubtle,
        padding: 12,
        borderRadius: 10,
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.textPrimary,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.textMuted,
        textAlign: 'center',
        marginTop: 6,
    },
});