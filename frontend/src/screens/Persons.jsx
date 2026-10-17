import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Back, Search, AddUser } from '../assets/index.js';
import personImage from "../assets/images/personImage.png";
import PersonFilter from '../components/PersonFilter.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Persons = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { BASE_URL, accessToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [personsDetails, setPersonDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Person API Function
  const handleFetchPerson = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/persons`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log("FETCH PERSON DTAILS: ", res.data.persons)
      if (res.data.success) {
        setPersonDetails(res.data.persons || []);
      } else {
        setPersonDetails([]);
      }
    } catch (error) {
      // console.log("Fetch Persons Error:", error.response?.data || error.message);
      setPersonDetails([]);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, accessToken]);

  // 2. Refresh list whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      handleFetchPerson();
    }, [handleFetchPerson])
  );

  // 3. Search & Filter Memoized Calculation
  const filteredPersons = useMemo(() => {
    let result = [...personsDetails];

    // Search filter (by name or phone number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (person) =>
          person.name?.toLowerCase().includes(query) ||
          person.phone?.toLowerCase().includes(query)
      );
    }

    // Sorting & Financial Filters
    if (selectedFilter === 'asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (selectedFilter === 'desc') {
      result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else if (selectedFilter === 'get') {
      result = result.filter((person) => (person.netBalance || 0) > 0);
    } else if (selectedFilter === 'give') {
      result = result.filter((person) => (person.netBalance || 0) < 0);
    }

    return result;
  }, [personsDetails, searchQuery, selectedFilter]);

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case 'asc':
        return 'A to Z (Ascending)';
      case 'desc':
        return 'Z to A (Descending)';
      case 'get':
        return "You'll get";
      case 'give':
        return "You'll give";
      default:
        return '';
    }
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
              navigation.navigate('welcome');
            }
          }}
        >
          <Back width={16} height={16} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold" style={{ color: theme.textPrimary }}>
          All Persons
        </Text>
        <View className="w-10 h-10" />
      </View>

      {/* Search Bar with Filter Function */}
      <View style={styles.inputContainer}>
        <Search width={16} height={16} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          placeholder="Search by name or number..."
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
        <PersonFilter
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </View>

      {/* Active Filter Badge */}
      {selectedFilter !== 'all' && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>
            Filter: <Text style={styles.activeFilterHighlight}>{getFilterLabel()}</Text>
          </Text>
          <TouchableOpacity
            style={styles.resetFilterButton}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={styles.resetFilterText}>Clear ✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator or Persons List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPersons}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filteredPersons.length === 0 ? styles.emptyContainer : { paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No persons found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No results match "${searchQuery}"`
                  : 'No persons added yet or matching the selected filter'}
              </Text>
              {(searchQuery !== '' || selectedFilter !== 'all') && (
                <TouchableOpacity
                  style={styles.clearAllBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                >
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const youWillGet = item.totalGet || 0;
            const youWillGive = item.totalGive || 0;

            // Handle image source: Cloudinary URL or local placeholder
            const imageSource = item.profileImage && item.profileImage.url
              ? { uri: item.profileImage.url }
              : personImage;

            return (
              <TouchableOpacity
                className="w-full rounded-xl p-4 my-2"
                style={styles.personCard}
                onPress={() => navigation.navigate('PersonDetails', { person: item })}
              >
                <View className="flex-row items-center gap-4">
                  <Image source={imageSource} className="w-16 h-16 rounded-full" style={styles.personImage} />
                  <View className="flex-1" style={styles.personInfo}>
                    <Text style={styles.personName}>{item.name}</Text>
                    <Text style={styles.personNumber}>{item.phone || '---'}</Text>
                    <View style={styles.personBalance}>
                      <Text style={[styles.personBalanceAmount, { color: theme.amountGet }]}>
                        ₹{youWillGet.toLocaleString('en-IN')}
                      </Text>
                      <View style={styles.balanceDivider} />
                      <Text style={[styles.personBalanceAmount, { color: theme.amountGive }]}>
                        -₹{youWillGive.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => (item._id ? item._id.toString() : item.id.toString())}
        />
      )}

      {/* Add Person Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-5 right-5 w-16 h-16 rounded-full flex justify-center items-center"
        style={{ backgroundColor: theme.primary }}
        onPress={() => navigation.navigate('AddPerson')}
      >
        <AddUser width={20} height={20} color={theme.surface} />
      </TouchableOpacity>
    </View>
  );
};

export default Persons;

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
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  activeFilterText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  activeFilterHighlight: {
    fontWeight: '700',
    color: theme.primary,
  },
  resetFilterButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: theme.surfaceSubtle,
    borderRadius: 6,
  },
  resetFilterText: {
    fontSize: 12,
    color: theme.amountGive,
    fontWeight: '600',
  },
  personCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  personImage: {
    borderColor: theme.border,
    borderWidth: 1,
  },
  personInfo: {
    justifyContent: 'center',
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  personNumber: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  personBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  personBalanceAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  balanceDivider: {
    width: 1,
    height: 16,
    backgroundColor: theme.border,
    marginHorizontal: 8,
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
    marginVertical: 6,
  },
  clearAllBtn: {
    marginTop: 10,
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearAllText: {
    color: theme.surface,
    fontSize: 13,
    fontWeight: '600',
  },
});