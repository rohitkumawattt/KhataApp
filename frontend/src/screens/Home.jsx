import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

import {
    PlusBtn,
    AddUser,
    History,
    Backup,
    Bell,
    Back,
} from '../assets/index.js';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const quickActions = [
    {
        id: 1,
        name: 'Add Entry',
        icon: PlusBtn,
        screen: 'AddEntry',
    },
    {
        id: 2,
        name: 'Add Person',
        icon: AddUser,
        screen: 'AddPerson',
    },
    {
        id: 3,
        name: 'Entries',
        icon: History,
        screen: 'Entries',
    },
    {
        id: 4,
        name: 'Backup',
        icon: Backup,
        screen: '',
    },
];

const Home = ({ navigation }) => {
    const { theme } = useTheme();
    const { user, BASE_URL, accessToken } = useAuth();

    // States
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        youWillGet: 0,
        youWillGive: 0,
        netTotal: 0,
        totalCustomers: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 1. Fetch Summary Data from Backend API (/transaction/summery)
    const fetchDashboardSummary = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/transaction/summery`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            // console.log("DASHOBOARD RESPONCE : ", response.data.summary)
            if (response.data.success) {
                setSummary(response.data.summary);
            }
        } catch (error) {
            console.log('GET SUMMARY ERROR:', error?.response?.data || error.message);
        }
    };

    // 2. Fetch Recent Transactions
    const fetchRecentTransactions = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/transaction/top`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (response.data.success) {
                setTransactions(response.data.entries);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            Alert.alert('GET TRANSACTIONS ERROR:', error?.response?.data?.message || error.message);
            setTransactions([]);
        }
    };

    // Consolidated Load Function
    const loadHomeData = async () => {
        await Promise.all([fetchDashboardSummary(), fetchRecentTransactions()]);
        setLoading(false);
        setRefreshing(false);
    };

    // Auto Refresh when Screen Comes into Focus
    useFocusEffect(
        useCallback(() => {
            loadHomeData();
        }, [BASE_URL, accessToken])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadHomeData();
    };

    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString('en-IN');
    };

    const formatDate = (date) => {
        if (!date) return '';
        const newDate = new Date(date);
        if (isNaN(newDate.getTime())) return '';

        return newDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: theme.background }}
            >
                <ActivityIndicator size="large" color={theme.primary} />
                <Text className="mt-3" style={{ color: theme.textMuted }}>
                    Loading your Khata...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 120,
                }}
            >
                {/* HEADER */}
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-3xl font-bold" style={{ color: theme.textPrimary }}>
                            Welcome,
                        </Text>
                        <Text className="text-3xl font-bold" style={{ color: theme.primary }}>
                            {user?.name || 'User'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        className="w-11 h-11 rounded-xl items-center justify-center"
                        style={{
                            backgroundColor: theme.surface,
                            borderWidth: 1,
                            borderColor: theme.border,
                        }}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Bell width={22} height={22} fill={theme.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* BALANCE CARD (Data sourced from API summary state) */}
                <View
                    className="w-full rounded-2xl overflow-hidden mb-7"
                    style={{
                        backgroundColor: theme.primary,
                        borderWidth: 1,
                        borderColor: theme.primaryLight,
                        elevation: 6,
                        shadowColor: theme.primary,
                        shadowOffset: { width: 0, height: 5 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                    }}
                >
                    <Image
                        source={require('../assets/images/graph.png')}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            right: 0,
                            top: 0,
                            resizeMode: 'cover',
                            opacity: 0.45,
                        }}
                    />

                    <View className="p-5" style={{ backgroundColor: 'rgba(255,255,255,0.35)' }}>
                        <Text className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                            Total Balance
                        </Text>

                        <Text
                            className="text-4xl font-extrabold mt-1 mb-5"
                            style={{
                                color: summary.netTotal >= 0 ? '#0F172A' : theme.amountGive,
                            }}
                        >
                            {summary.netTotal < 0 ? '-' : ''}₹{formatMoney(Math.abs(summary.netTotal))}
                        </Text>

                        <View className="flex-row">
                            {/* YOU WILL GET */}
                            <View
                                className="flex-1 rounded-xl p-3 mr-2"
                                style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                            >
                                <Text className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                                    You'll Get
                                </Text>
                                <Text className="text-xl font-bold mt-1" style={{ color: theme.amountGet }}>
                                    +₹{formatMoney(summary.youWillGet)}
                                </Text>
                            </View>

                            {/* YOU WILL GIVE */}
                            <View
                                className="flex-1 rounded-xl p-3 ml-2"
                                style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                            >
                                <Text className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                                    You'll Give
                                </Text>
                                <Text className="text-xl font-bold mt-1" style={{ color: theme.amountGive }}>
                                    -₹{formatMoney(summary.youWillGive)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* QUICK ACTIONS */}
                <View className="mb-7">
                    <Text className="text-xl font-bold mb-4" style={{ color: theme.textSecondary }}>
                        Quick Actions
                    </Text>

                    <View className="flex-row justify-between">
                        {quickActions.map((item) => {
                            const Icon = item.icon;
                            return (
                                <View key={item.id} className="items-center">
                                    <TouchableOpacity
                                        className="w-14 h-14 rounded-full items-center justify-center"
                                        style={{
                                            backgroundColor: theme.surfaceSubtle,
                                            borderWidth: 1,
                                            borderColor: theme.border,
                                        }}
                                        onPress={() => {
                                            if (item.screen) {
                                                navigation.navigate(item.screen);
                                            } else {
                                                Alert.alert(
                                                    'Coming Soon 🚀',
                                                );
                                            }
                                        }}
                                    >
                                        <Icon width={22} height={22} fill={theme.primary} />
                                    </TouchableOpacity>
                                    <Text
                                        className="text-xs font-medium mt-2"
                                        style={{ color: theme.textSecondary }}
                                    >
                                        {item.name}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* RECENT RECORDS */}
                <View>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-xl font-bold" style={{ color: theme.textSecondary }}>
                            Recent Records
                        </Text>

                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => navigation.navigate('Entries')}
                        >
                            <Text className="font-semibold mr-1" style={{ color: theme.primary }}>
                                View All
                            </Text>
                            <Back
                                width={14}
                                height={14}
                                fill={theme.primary}
                                style={{ transform: [{ rotate: '180deg' }] }}
                            />
                        </TouchableOpacity>
                    </View>

                    {transactions.length === 0 ? (
                        <View
                            className="items-center justify-center rounded-2xl p-7"
                            style={{
                                backgroundColor: theme.surface,
                                borderWidth: 1,
                                borderColor: theme.border,
                            }}
                        >
                            <View
                                className="w-14 h-14 rounded-full items-center justify-center mb-3"
                                style={{ backgroundColor: theme.primaryLight }}
                            >
                                <PlusBtn width={22} height={22} fill={theme.primary} />
                            </View>

                            <Text className="text-base font-bold" style={{ color: theme.textPrimary }}>
                                No records yet
                            </Text>

                            <Text className="text-sm text-center mt-1" style={{ color: theme.textMuted }}>
                                Add your first transaction to start maintaining your Khata.
                            </Text>

                            <TouchableOpacity
                                className="px-5 py-3 rounded-xl mt-4"
                                style={{ backgroundColor: theme.primary }}
                                onPress={() => navigation.navigate('AddEntry')}
                            >
                                <Text className="font-semibold" style={{ color: theme.surface }}>
                                    + Add Entry
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            {transactions.slice(0, 10).map((transaction, index) => {
                                const isGet = transaction.type === 'get';
                                const amount = Number(transaction.amount) || 0;
                                const personName = transaction.personId?.name || 'Unknown Person';

                                return (
                                    <TouchableOpacity
                                        key={transaction._id || transaction.id || index}
                                        className="flex-row items-center justify-between rounded-xl p-4 mb-2"
                                        style={{
                                            backgroundColor: theme.surface,
                                            borderWidth: 1,
                                            borderColor: theme.border,
                                        }}
                                        onPress={() => navigation.navigate('Entries')}
                                    >
                                        <View className="flex-1 mr-3">
                                            <Text
                                                className="text-base font-semibold"
                                                numberOfLines={1}
                                                style={{ color: theme.textPrimary }}
                                            >
                                                {personName}
                                            </Text>

                                            <Text className="text-[11px] mt-1" style={{ color: theme.textMuted }}>
                                                {formatDate(transaction.date || transaction.createdAt)}
                                            </Text>
                                        </View>

                                        <View className="items-end">
                                            <Text
                                                className="text-base font-bold"
                                                style={{
                                                    color: isGet ? theme.amountGet : theme.amountGive,
                                                }}
                                            >
                                                {isGet ? '+' : '-'}₹{formatMoney(amount)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default Home;