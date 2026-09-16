import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { watchlistManager } from '../../watchlist/watchlistManager';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta Platforms' },
];

const ALL_SYMBOLS = [
  ...POPULAR_SYMBOLS,
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'AMD', name: 'Advanced Micro Devices' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'INFY', name: 'Infosys Limited' },
];

export default function SymbolSearchScreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['AAPL', 'TSLA']);
  const [searchResults, setSearchResults] = useState(ALL_SYMBOLS);

  // Watchlist confirm modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [targetSymbol, setTargetSymbol] = useState<{ symbol: string; name: string } | null>(null);
  const [isTargetInWatchlist, setIsTargetInWatchlist] = useState(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);

  // Sync watchlist symbols on mount & changes
  useEffect(() => {
    const updateWatchlist = () => {
      const items = watchlistManager.getWatchlist();
      setWatchlistSymbols(items.map((i) => i.symbol.toUpperCase()));
    };

    updateWatchlist();
    watchlistManager.on('change', updateWatchlist);
    return () => {
      watchlistManager.off('change', updateWatchlist);
    };
  }, []);

  // 300ms Debounce Setup
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults(ALL_SYMBOLS);
    } else {
      const filtered = ALL_SYMBOLS.filter(
        (item) =>
          item.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [debouncedQuery]);

  const handleSelectSymbol = (symbol: string, name?: string) => {
    if (!recentSearches.includes(symbol)) {
      setRecentSearches([symbol, ...recentSearches.slice(0, 4)]);
    }
    
    const selectedItem = ALL_SYMBOLS.find((item) => item.symbol === symbol);
    const companyName = name || selectedItem?.name || symbol;

    navigation.navigate('StockDetail', { 
      symbol: symbol, 
      companyName: companyName 
    });
  };

  const handleWatchBtnPress = (e: any, symbol: string, name: string) => {
    e.stopPropagation();
    const inList = watchlistManager.isInWatchlist(symbol);
    setTargetSymbol({ symbol, name });
    setIsTargetInWatchlist(inList);
    setConfirmModalVisible(true);
  };

  const handleConfirmWatchlistAction = () => {
    if (!targetSymbol) return;
    if (isTargetInWatchlist) {
      watchlistManager.removeFromWatchlist(targetSymbol.symbol);
    } else {
      watchlistManager.addToWatchlist(targetSymbol.symbol, targetSymbol.name);
    }
    setConfirmModalVisible(false);
    setTargetSymbol(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search symbols or companies..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!query && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <View style={styles.chipRow}>
            {recentSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => handleSelectSymbol(item)}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Popular Symbols</Text>
          <View style={styles.chipRow}>
            {POPULAR_SYMBOLS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularChip}
                onPress={() => handleSelectSymbol(item.symbol, item.name)}
              >
                <Text style={styles.popularChipText}>{item.symbol}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => {
          const isAdded = watchlistSymbols.includes(item.symbol.toUpperCase());
          return (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelectSymbol(item.symbol, item.name)}
            >
              <View>
                <Text style={styles.resultSymbol}>{item.symbol}</Text>
                <Text style={styles.resultName}>{item.name}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.addButton, isAdded && styles.addedButton]}
                onPress={(e) => handleWatchBtnPress(e, item.symbol, item.name)}
              >
                <Text style={[styles.addButtonText, isAdded && styles.addedButtonText]}>
                  {isAdded ? '✓ Added' : '＋ Watch'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.resultsList}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={confirmModalVisible}
        title={isTargetInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        message={
          isTargetInWatchlist
            ? `Are you sure you want to remove ${targetSymbol?.symbol} from your Watchlist?`
            : `Are you sure you want to add ${targetSymbol?.symbol} to your Watchlist?`
        }
        confirmText={isTargetInWatchlist ? 'Yes, Remove' : 'Yes, Add'}
        confirmVariant={isTargetInWatchlist ? 'danger' : 'primary'}
        onConfirm={handleConfirmWatchlistAction}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F3F4', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backButtonText: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F3F4', paddingHorizontal: 16, borderRadius: 12, height: 48 },
  input: { flex: 1, fontSize: 16, color: '#1A1A1A' },
  clearText: { fontSize: 16, color: '#666', padding: 4 },
  section: { paddingHorizontal: 16, marginTop: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#F8F9FA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#333' },
  popularChip: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  popularChipText: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  resultsList: { paddingHorizontal: 16 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultSymbol: { fontSize: 16, fontWeight: '700', color: '#111' },
  resultName: { fontSize: 13, color: '#666', marginTop: 2 },
  addButton: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addButtonText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  addedButton: { backgroundColor: '#D1FAE5' },
  addedButtonText: { color: '#059669', fontWeight: '700' },
});