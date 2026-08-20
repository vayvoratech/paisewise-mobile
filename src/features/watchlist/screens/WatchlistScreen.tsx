import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  isPositive: boolean;
}

const INITIAL_WATCHLIST: WatchlistItem[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 189.42, change: 1.25, isPositive: true },
  { id: '2', symbol: 'TSLA', name: 'Tesla Inc.', price: 219.80, change: -3.40, isPositive: false },
  { id: '3', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 878.36, change: 4.12, isPositive: true },
  { id: '4', symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.50, change: 0.85, isPositive: true },
];

/** 
 * 1. Standalone component outside of WatchlistScreen.
 * Hooks are called at the correct top level of a valid React component.
 */
function WatchlistCard({ 
  item, 
  onPress 
}: { 
  item: WatchlistItem; 
  onPress: () => void 
}) {
  const translateX = useSharedValue(0);

  const panStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.rowContainer}>
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>Delete</Text>
      </View>
      <Animated.View style={[styles.card, panStyle]}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.symbolText}>{item.symbol}</Text>
            <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            <View style={[styles.badge, { backgroundColor: item.isPositive ? '#E6F4EA' : '#FCE8E6' }]}>
              <Text style={[styles.badgeText, { color: item.isPositive ? '#137333' : '#C5221F' }]}>
                {item.isPositive ? '+' : ''}{item.change}%
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/** 2. Main Watchlist Screen Component */
export default function WatchlistScreen({ navigation }: { navigation: any }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);

  const removeItem = useCallback((id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watchlist</Text>
        <TouchableOpacity 
          style={styles.searchIconBtn}
          onPress={() => navigation.navigate('SymbolSearch')}
        >
          <Text style={styles.searchIconSymbol}>🔍</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WatchlistCard 
            item={item} 
            onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol })} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📉</Text>
            <Text style={styles.emptyTitle}>Your Watchlist is Empty</Text>
            <Text style={styles.emptySubtitle}>Search and add symbols to track live prices effortlessly.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1A1A1A' },
  searchIconBtn: { padding: 8, backgroundColor: '#EDF2F7', borderRadius: 20 },
  searchIconSymbol: { fontSize: 16 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  rowContainer: { marginVertical: 6, position: 'relative' },
  deleteBackground: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: '#EA4335', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 24, borderRadius: 12, width: '100%' },
  deleteText: { color: '#FFF', fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  symbolText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  nameText: { fontSize: 13, color: '#666', marginTop: 2, maxWidth: 160 },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  badge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20 },
});