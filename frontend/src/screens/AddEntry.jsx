import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-native-date-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Dialog, Portal } from 'react-native-paper';
import { Back, Trash } from '../assets';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const parseEntryDate = (d) => {
    if (!d) return new Date();
    if (d instanceof Date && !isNaN(d.getTime())) return d;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const getInitialAmount = (entry) => {
    if (!entry) return '';
    if (entry.amount !== undefined && entry.amount !== null) return String(entry.amount);
    if (entry.youWillGet !== undefined && entry.youWillGet !== null) return String(entry.youWillGet);
    if (entry.youWillGive !== undefined && entry.youWillGive !== null) return String(entry.youWillGive);
    return '';
};

const getInitialType = (entry) => {
    if (!entry) return 'get';
    if (entry.type) return entry.type;
    if (entry.youWillGive !== undefined && entry.youWillGive > 0) return 'give';
    return 'get';
};

const AddEntry = ({ navigation, route }) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { BASE_URL, accessToken } = useAuth();
    const { entry, person } = route?.params || {};
    const isEditMode = !!entry;

    // Person Name Initialization Logic
    const initialPersonObj = person || (entry?.personId && typeof entry.personId === 'object' ? entry.personId : null);
    const initialPersonName = entry?.name || entry?.personName || initialPersonObj?.name || '';

    const [personName, setPersonName] = useState(initialPersonName);
    const [selectedPerson, setSelectedPerson] = useState(initialPersonObj);

    const [date, setDate] = useState(() => parseEntryDate(entry?.date));
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [amount, setAmount] = useState(() => getInitialAmount(entry));
    const [transactionType, setTransactionType] = useState(() => getInitialType(entry));
    const [note, setNote] = useState(entry?.note || '');

    // UI & Dynamic Data States
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [personsList, setPersonsList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Delete Modal / Action States
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch Persons List for Dynamic Suggestions
    const fetchPersons = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/persons`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.data.success) {
                setPersonsList(res.data.persons || []);
            }
        } catch (error) {
            console.log('Error fetching persons for suggestions:', error.response?.data || error.message);
        }
    }, [BASE_URL, accessToken]);

    useFocusEffect(
        useCallback(() => {
            fetchPersons();
        }, [fetchPersons])
    );

    const formatDate = (d) => {
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // Save/Update Entry Handler
    const handleSaveEntry = async () => {
        if (!personName.trim()) {
            return;
        }

        if (!isEditMode && !selectedPerson?._id && !selectedPerson?.id) {
            return;
        }

        if (!amount || Number(amount) <= 0) {
            return;
        }

        setLoading(true);

        try {
            let response;

            if (isEditMode) {
                const transactionId = entry._id || entry.id;
                const payload = {
                    type: transactionType,
                    amount: Number(amount),
                    note: note.trim(),
                    date: date.toISOString(),
                };

                response = await axios.put(`${BASE_URL}/transaction/update/${transactionId}`, payload, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            } else {
                const personId = selectedPerson._id;
                const payload = {
                    personId,
                    type: transactionType,
                    amount: Number(amount),
                    note: note.trim(),
                    date: date.toISOString(),
                };

                response = await axios.post(`${BASE_URL}/transaction/add`, payload, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            if (response.data.success) {
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('MainTabs');
                }
            }
        } catch (error) {
            console.error('Save Entry Error:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Execute Delete Transaction API Handler
    const handleDeleteEntry = async () => {
        const transactionId = entry?._id;
        if (!transactionId) return;

        try {
            setDeleteLoading(true);
            const response = await axios.delete(`${BASE_URL}/transaction/delete/${transactionId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.data.success) {
                setDeleteDialogVisible(false);
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    navigation.navigate('MainTabs');
                }
            }
        } catch (error) {
            console.error('Delete Entry Error:', error.response?.data || error.message);
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredPersons = personsList.filter((p) =>
        p.name?.toLowerCase().includes(personName.toLowerCase().trim())
    );

    return (
        <View className="flex-1 p-5" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="w-full flex-row items-center justify-between mb-2">
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
                    {isEditMode ? 'Update Entry' : 'Add Khata'}
                </Text>

                {/* Right Header Area: Delete Button in Edit Mode */}
                {isEditMode ? (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => setDeleteDialogVisible(true)}
                        disabled={loading}
                    >
                        <Trash width={18} height={18} fill={theme.amountGive} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.headerPlaceholder} />
                )}
            </View>

            {/* Entry Form */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Person Name Input & Suggestions */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Person Name</Text>
                    <View style={styles.nameInputWrapper}>
                        <TextInput
                            style={[styles.nameInput, isEditMode && { opacity: 0.7 }]}
                            placeholder="Enter person name..."
                            placeholderTextColor={theme.textMuted}
                            value={personName}
                            editable={!isEditMode && !loading}
                            onChangeText={(text) => {
                                setPersonName(text);
                                setSelectedPerson(null);
                                setShowSuggestions(text.length > 0);
                            }}
                        />
                    </View>

                    {!isEditMode && showSuggestions && (
                        <View style={styles.suggestionContainer}>
                            {filteredPersons.length > 0 ? (
                                filteredPersons.map((p) => (
                                    <TouchableOpacity
                                        key={p._id || p.id}
                                        style={styles.suggestionItem}
                                        onPress={() => {
                                            setPersonName(p.name);
                                            setSelectedPerson(p);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.suggestionName}>{p.name}</Text>
                                            <Text style={styles.suggestionNumber}>{p.phone || 'No Number'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <TouchableOpacity
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        setShowSuggestions(false);
                                        navigation.navigate('AddPerson');
                                    }}
                                >
                                    <View>
                                        <Text style={styles.suggestionName}>No person found with this name</Text>
                                        <Text style={[styles.suggestionNumber, { color: theme.primary, fontWeight: '600' }]}>
                                            + Add New Person
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Date & Amount Row */}
                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity
                            style={styles.inputBox}
                            onPress={() => setDatePickerOpen(true)}
                            disabled={loading}
                        >
                            <Text style={styles.inputText}>{formatDate(date)}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Amount</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.rupee}>₹</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0"
                                placeholderTextColor={theme.textMuted}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={!loading}
                            />
                        </View>
                    </View>
                </View>

                {/* Transaction Type */}
                <Text style={styles.label}>Transaction Type</Text>
                <View style={styles.typeContainer}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            transactionType === 'get' && styles.getActive,
                        ]}
                        onPress={() => setTransactionType('get')}
                        disabled={loading}
                    >
                        <Text
                            style={[
                                styles.typeText,
                                transactionType === 'get' && styles.activeTypeText,
                            ]}
                        >
                            You Will Get
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            transactionType === 'give' && styles.giveActive,
                        ]}
                        onPress={() => setTransactionType('give')}
                        disabled={loading}
                    >
                        <Text
                            style={[
                                styles.typeText,
                                transactionType === 'give' && styles.activeTypeText,
                            ]}
                        >
                            You Will Give
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Note */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Note (optional)</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="What is this transaction for?"
                        placeholderTextColor={theme.textMuted}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        textAlignVertical="top"
                        maxLength={250}
                        editable={!loading}
                    />
                    <Text style={styles.characterCount}>{note.length}/250</Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.addButton, loading && { opacity: 0.7 }]}
                    onPress={handleSaveEntry}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.surface} />
                    ) : (
                        <Text style={styles.addButtonText}>
                            {isEditMode ? 'Save Entry' : '+ Add Entry'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Delete Confirmation Paper Dialog */}
            <Portal>
                <Dialog
                    visible={deleteDialogVisible}
                    onDismiss={() => setDeleteDialogVisible(false)}
                    style={{ backgroundColor: theme.surface, borderRadius: 18 }}
                >
                    <Dialog.Title style={{ color: theme.textPrimary, fontWeight: 'bold' }}>
                        Delete Entry?
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                            Are you sure you want to delete this transaction entry? This action cannot be undone.
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
                            onPress={handleDeleteEntry}
                            loading={deleteLoading}
                            disabled={deleteLoading}
                            textColor={theme.amountGive}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <DatePicker
                modal
                open={datePickerOpen}
                date={date}
                mode="date"
                onConfirm={(selectedDate) => {
                    setDatePickerOpen(false);
                    setDate(selectedDate);
                }}
                onCancel={() => {
                    setDatePickerOpen(false);
                }}
            />
        </View>
    );
};

export default AddEntry;

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
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.amountGiveBg,
        borderWidth: 1,
        borderColor: theme.amountGive,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerPlaceholder: {
        width: 40,
        height: 40,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.textPrimary,
        marginBottom: 8,
    },
    nameInputWrapper: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        backgroundColor: theme.surface,
    },
    nameInput: {
        height: 50,
        paddingHorizontal: 14,
        fontSize: 15,
        color: theme.textPrimary,
    },
    suggestionContainer: {
        marginTop: 4,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        overflow: 'hidden',
    },
    suggestionItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    suggestionName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.textPrimary,
    },
    suggestionNumber: {
        marginTop: 3,
        fontSize: 12,
        color: theme.textSecondary,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    halfInput: {
        flex: 1,
    },
    inputBox: {
        height: 50,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 14,
        backgroundColor: theme.surface,
    },
    inputText: {
        fontSize: 15,
        color: theme.textPrimary,
    },
    amountContainer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        backgroundColor: theme.surface,
    },
    rupee: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.textPrimary,
        marginRight: 5,
    },
    amountInput: {
        flex: 1,
        fontSize: 15,
        color: theme.textPrimary,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    typeButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    getActive: {
        backgroundColor: theme.amountGetBg,
        borderColor: theme.amountGet,
    },
    giveActive: {
        backgroundColor: theme.amountGiveBg,
        borderColor: theme.amountGive,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.textSecondary,
    },
    activeTypeText: {
        color: theme.textPrimary,
    },
    noteInput: {
        minHeight: 100,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        color: theme.textPrimary,
        backgroundColor: theme.surface,
    },
    characterCount: {
        textAlign: 'right',
        marginTop: 4,
        fontSize: 11,
        color: theme.textMuted,
    },
    addButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: theme.surface,
        fontSize: 15,
        fontWeight: '700',
    },
});