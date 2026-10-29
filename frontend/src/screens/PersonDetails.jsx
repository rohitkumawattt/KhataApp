import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { Back, Phone, PlusBtn, Trash, Update } from '../assets';
import personImageDefault from '../assets/images/personImage.png';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import PersonMenu from '../components/PersonMenu.jsx';

const PersonDetails = ({ route, navigation }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { BASE_URL, accessToken } = useAuth();
    const { person = {} } = route?.params || {};

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Delete Dialog States
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const resolveImageSource = (img) => {
        if (!img) return personImageDefault;
        if (typeof img === 'string') return { uri: img };
        if (typeof img === 'object' && img.uri) return img;
        if (typeof img === 'object' && img.url) return { uri: img.url };
        return img;
    };

    const youWillGet = Number(person.totalGet || person.youWillGet) || 0;
    const youWillGive = Number(person.totalGive || person.youWillGive) || 0;
    const netBalance = person.netBalance !== undefined ? Number(person.netBalance) : (youWillGet - youWillGive);

    // Fetch Transactions specific to this person
    const fetchPersonTransactions = useCallback(async () => {
        const personId = person._id || person.id;
        if (!personId) return;

        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/transaction`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.data.success) {
                const allTx = res.data.entries || res.data.transactions || [];
                // Filter transactions matching this personId
                const personTx = allTx.filter((t) => {
                    const pId = t.personId?._id || t.personId;
                    return pId?.toString() === personId?.toString();
                });
                setTransactions(personTx);
            }
        } catch (error) {
            console.error('Error fetching person transactions:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    }, [BASE_URL, accessToken, person]);

    useFocusEffect(
        useCallback(() => {
            fetchPersonTransactions();
        }, [fetchPersonTransactions])
    );

    const handleCall = () => {
        if (person.number || person.phone) {
            const num = person.number || person.phone;
            Linking.openURL(`tel:${num}`).catch(() => {
                Alert.alert('Error', 'Could not open phone dialer');
            });
        } else {
            Alert.alert('No Number', 'Phone number is not available for this person.');
        }
    };

    // Delete Person Handler
    const handleDeletePerson = async () => {
        const personId = person._id;
        if (!personId) return;

        try {
            setDeleteLoading(true);
            const response = await axios.delete(`${BASE_URL}/persons/delete/${personId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("DELETE PERSON RESPONSE: ", response);

            if (response.data.success) {
                setDeleteDialogVisible(false);
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('MainTabs');
                }
            } else {
                Alert.alert('Delete Failed ❌', response.data.message || 'Could not delete person.');
            }
        } catch (error) {
            console.error('Delete Person Error:', error.response?.data || error.message);
            Alert.alert('Error ❌', error.response?.data?.message || 'Server error while deleting person.');
        } finally {
            setDeleteLoading(false);
        }
    };

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

                <Text style={styles.headerTitle} numberOfLines={1}>
                    {person.name || 'Person Details'}
                </Text>

                <TouchableOpacity
                    style={styles.deleteHeaderBtn}
                    onPress={() => setDeleteDialogVisible(true)}
                >
                    <Trash width={18} height={18} fill={theme.amountGive} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={resolveImageSource(person.profileImage || person.image)}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                    </View>

                    <Text style={styles.personName}>{person.name || 'Unknown Name'}</Text>

                    {(!!person.phone || !!person.number) && (
                        <View style={styles.phoneRow}>
                            <Phone width={14} height={14} fill={theme.textSecondary} />
                            <Text style={styles.personNumber}>{person.phone || person.number}</Text>
                        </View>
                    )}

                    {!!person.address && (
                        <Text style={styles.personAddress}>{person.address}</Text>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                            <View style={[styles.actionIconCircle, { backgroundColor: theme.primaryLight }]}>
                                <Phone width={16} height={16} fill={theme.primary} />
                            </View>
                            <Text style={styles.actionBtnText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('AddPerson', { person })}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: theme.surfaceSubtle }]}>
                                <Update width={16} height={16} />
                            </View>
                            <Text style={styles.actionBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('AddEntry', { person })}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: theme.primaryLight }]}>
                                <PlusBtn width={16} height={16} fill={theme.primary} />
                            </View>
                            <Text style={styles.actionBtnText}>Add Entry</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Net Balance Banner */}
                <View
                    style={[
                        styles.netBalanceCard,
                        netBalance > 0
                            ? { backgroundColor: theme.amountGetBg, borderColor: theme.amountGet }
                            : netBalance < 0
                                ? { backgroundColor: theme.amountGiveBg, borderColor: theme.amountGive }
                                : { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                    ]}
                >
                    <Text style={styles.netBalanceLabel}>Net Balance Status</Text>
                    <Text
                        style={[
                            styles.netBalanceValue,
                            netBalance > 0
                                ? { color: theme.amountGet }
                                : netBalance < 0
                                    ? { color: theme.amountGive }
                                    : { color: theme.textPrimary },
                        ]}
                    >
                        {netBalance > 0
                            ? `You will get ₹${netBalance.toLocaleString('en-IN')}`
                            : netBalance < 0
                                ? `You will give ₹${Math.abs(netBalance).toLocaleString('en-IN')}`
                                : 'Settled (₹0)'}
                    </Text>
                </View>

                {/* Dual Amount Breakdown Cards */}
                <View style={styles.amountCardsRow}>
                    {/* You Will Get Card */}
                    <View style={[styles.amountCard, { backgroundColor: theme.surface, borderColor: theme.amountGet }]}>
                        <View style={styles.amountCardHeader}>
                            <View style={[styles.dotIndicator, { backgroundColor: theme.amountGet }]} />
                            <Text style={styles.amountCardLabel}>You will get</Text>
                        </View>
                        <Text style={[styles.amountCardValue, { color: theme.amountGet }]}>
                            ₹{youWillGet.toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.amountCardSubtext}>Lene Hai</Text>
                    </View>

                    {/* You Will Give Card */}
                    <View style={[styles.amountCard, { backgroundColor: theme.surface, borderColor: theme.amountGive }]}>
                        <View style={styles.amountCardHeader}>
                            <View style={[styles.dotIndicator, { backgroundColor: theme.amountGive }]} />
                            <Text style={styles.amountCardLabel}>You will give</Text>
                        </View>
                        <Text style={[styles.amountCardValue, { color: theme.amountGive }]}>
                            ₹{youWillGive.toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.amountCardSubtext}>Dene Hai</Text>
                    </View>
                </View>

                {/* Transaction History Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Transactions History</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyHistoryCard}>
                        <Text style={styles.emptyHistoryTitle}>No transactions recorded yet</Text>
                        <Text style={styles.emptyHistorySub}>
                            Add a new entry to track payments and credit with {person.name || 'this person'}.
                        </Text>
                        <TouchableOpacity
                            style={styles.addEntryBtn}
                            onPress={() => navigation.navigate('AddEntry', { person })}
                        >
                            <PlusBtn width={14} height={14} fill={theme.surface} />
                            <Text style={styles.addEntryBtnText}>Add New Entry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {transactions.map((tx) => {
                            const isGet = tx.type === 'get';
                            const amt = tx.amount ? tx.amount.toLocaleString('en-IN') : '0';

                            return (
                                <TouchableOpacity
                                    key={tx._id || tx.id}
                                    style={styles.txCard}
                                    onPress={() => navigation.navigate('AddEntry', { entry: tx, person })}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.txDate}>{formatDate(tx.date || tx.createdAt)}</Text>
                                        <Text style={styles.txNote} numberOfLines={1}>{tx.note || (isGet ? 'You will get' : 'You will give')}</Text>
                                    </View>
                                    <Text style={[styles.txAmount, { color: isGet ? theme.amountGet : theme.amountGive }]}>
                                        {isGet ? `+₹${amt}` : `-₹${amt}`}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Delete Person Confirmation Dialog */}
            <Portal>
                <Dialog
                    visible={deleteDialogVisible}
                    onDismiss={() => setDeleteDialogVisible(false)}
                    style={{ backgroundColor: theme.surface, borderRadius: 18 }}
                >
                    <Dialog.Title style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
                        Delete Person?
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                            Are you sure you want to delete {person.name || 'this person'}? All associated transaction entries will also be permanently deleted.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            onPress={() => setDeleteDialogVisible(false)}
                            textColor={theme.textMuted}
                            disabled={deleteLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onPress={handleDeletePerson}
                            loading={deleteLoading}
                            disabled={deleteLoading}
                            textColor={theme.amountGive}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

export default PersonDetails;

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
    deleteHeaderBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.amountGiveBg || theme.surface,
        borderWidth: 1,
        borderColor: theme.amountGive,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '700',
        color: theme.textPrimary,
        marginHorizontal: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: theme.surface,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        marginTop: 10,
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: theme.primary,
        backgroundColor: theme.surfaceSubtle,
    },
    personName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.textPrimary,
        marginBottom: 4,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    personNumber: {
        fontSize: 14,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    personAddress: {
        fontSize: 13,
        color: theme.textMuted,
        textAlign: 'center',
        marginTop: 2,
        paddingHorizontal: 16,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        marginTop: 18,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        width: '100%',
    },
    actionBtn: {
        alignItems: 'center',
    },
    actionIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.textSecondary,
    },
    netBalanceCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 16,
    },
    netBalanceLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    netBalanceValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    amountCardsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    amountCard: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
    },
    amountCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    dotIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    amountCardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.textSecondary,
    },
    amountCardValue: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 2,
    },
    amountCardSubtext: {
        fontSize: 11,
        color: theme.textMuted,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.textPrimary,
    },
    emptyHistoryCard: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        borderStyle: 'dashed',
    },
    emptyHistoryTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.textPrimary,
        marginBottom: 6,
    },
    emptyHistorySub: {
        fontSize: 13,
        color: theme.textMuted,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 18,
    },
    addEntryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.primary,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addEntryBtnText: {
        color: theme.surface,
        fontSize: 14,
        fontWeight: '600',
    },
    txCard: {
        backgroundColor: theme.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    txDate: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.textPrimary,
    },
    txNote: {
        fontSize: 12,
        color: theme.textMuted,
        marginTop: 2,
    },
    txAmount: {
        fontSize: 15,
        fontWeight: '700',
    },
});