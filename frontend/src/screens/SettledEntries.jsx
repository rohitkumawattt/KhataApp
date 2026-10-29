import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Back, Search, PlusBtn, ThreeDots } from '../assets/index.js';

const SettledEntries = ({ navigation }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { BASE_URL, accessToken } = useAuth();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Transactions History from Backend
    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/transaction/settled`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log("SETTLED TRANSACTION RESPONCE: ", response.data.settledTransaction)
            if (response.data.success) {
                setTransactions(response.data.settledTransaction);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error('Fetch Transactions Error:', error.response?.data || error.message);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [BASE_URL, accessToken]);

    // Auto-refresh history list when coming to this screen
    useFocusEffect(
        useCallback(() => {
            fetchTransactions();
        }, [fetchTransactions])
    );
    // Search Filtering Logic
    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return transactions;
        const q = searchQuery.toLowerCase().trim();

        return transactions.filter((item) => {
            const personName = item.personId?.name || item.personName || '';
            const note = item.note || '';
            const amountStr = item.amount ? item.amount.toString() : '';

            return (
                personName.toLowerCase().includes(q) ||
                note.toLowerCase().includes(q) ||
                amountStr.includes(q)
            );
        });
    }, [transactions, searchQuery]);

    // Format ISO Date string to localized Indian Date format
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <View className="flex-1 p-5" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="w-full flex-row items-center justify-between">
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
                <Text className="flex-1 text-center text-lg font-bold" style={{ color: theme.textPrimary }}>
                    Setteld Entries (History)
                </Text>
                <View className="w-10 h-10" />
            </View>

            {/* Search Input Bar */}
            <View style={styles.inputContainer}>
                <Search width={16} height={16} style={{ marginRight: 10 }} />
                <TextInput
                    style={styles.input}
                    placeholder="Search by name, note or amount..."
                    placeholderTextColor={theme.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Transactions History List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredEntries}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => (item._id ? item._id.toString() : item.id.toString())}
                    contentContainerStyle={filteredEntries.length === 0 ? styles.emptyContainer : { paddingBottom: 80 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>No settled entries</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery ? `No results match "${searchQuery}"` : 'No transaction records found.'}
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => {
                        const personName = item.personId?.name || 'Unknown Person';
                        const isGet = item.type === 'get';
                        const formattedAmount = item.amount ? item.amount.toLocaleString('en-IN') : '0';
                        const itemId = item._id || item.id;

                        return (
                            <TouchableOpacity
                                className="flex-row items-center justify-between w-full rounded-xl p-4 my-2"
                                style={styles.entryCard}
                            >
                                <View className="flex-col flex-1 mr-2">
                                    <Text style={styles.entryName} numberOfLines={1}>{personName}</Text>
                                    <Text style={styles.entryDate}><Text className="md" style={{ color: theme.textPrimary }} text>Settled at :</Text> {formatDate(item.settledDate)}</Text>
                                    {item.note ? (
                                        <Text style={styles.entryNote} numberOfLines={1}>
                                            {item.note}
                                        </Text>
                                    ) : null}
                                </View>

                                <View className="flex-row items-center gap-2">
                                    <View className="flex-col items-end mr-2">
                                        <Text
                                            style={[
                                                styles.entryAmount,
                                                { color: isGet ? theme.amountGet : theme.amountGive },
                                            ]}
                                        >
                                            {isGet ? `+₹${formattedAmount}` : `-₹${formattedAmount}`}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View >
    );
};

export default SettledEntries;

const getStyles = (theme) => StyleSheet.create({
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surfaceSubtle,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: theme.textPrimary,
        paddingVertical: 0,
    },
    clearButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginRight: 4,
    },
    clearButtonText: {
        fontSize: 14,
        color: theme.textMuted,
        fontWeight: '600',
    },
    entryCard: {
        backgroundColor: theme.surfaceSubtle,
        borderWidth: 1,
        borderColor: theme.border,
    },
    entryName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.textPrimary,
        textDecorationLine: 'line-through'
    },
    entryDate: {
        color: theme.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    entryNote: {
        color: theme.textSecondary,
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    entryAmount: {
        fontSize: 15,
    },
    moreOptionsButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: theme.surfaceSubtle,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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