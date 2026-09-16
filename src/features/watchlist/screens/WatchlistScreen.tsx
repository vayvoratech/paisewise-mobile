import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { watchlistManager, WatchlistItem } from '../watchlistManager';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

function WatchlistCard({
  item,
  index,
  onPress,
  onDeletePress,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  item: WatchlistItem;
  index: number;
  onPress: () => void;
  onDeletePress: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onDragStart: (e: any, index: number) => void;
  onDragOver: (e: any) => void;
  onDrop: (e: any, index: number) => void;
}) {
  const isWeb = Platform.OS === 'web';

  const webDragProps = isWeb
    ? {
        draggable: true,
        onDragStart: (e: any) => onDragStart(e, index),
        onDragOver: onDragOver,
        onDrop: (e: any) => onDrop(e, index),
      }
    : {};

  return (
    <View style={styles.cardWrapper} {...(webDragProps as any)}>
      <View style={styles.card}>
        {/* Drag Handle & Arrow Controls */}
        <View style={styles.dragHandleSection}>
          <Text style={styles.dragGripIcon}>⋮⋮</Text>
          <View style={styles.reorderControls}>
            <TouchableOpacity disabled={isFirst} onPress={onMoveUp} style={[styles.arrowBtn, isFirst && styles.arrowDisabled]}>
              <Text style={styles.arrowText}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={isLast} onPress={onMoveDown} style={[styles.arrowBtn, isLast && styles.arrowDisabled]}>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Content Body */}
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

        {/* Delete Action Button */}
        <TouchableOpacity onPress={onDeletePress} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WatchlistScreen({ navigation }: { navigation: any }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [targetItemToDelete, setTargetItemToDelete] = useState<WatchlistItem | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const updateWatchlist = () => {
      setWatchlist(watchlistManager.getWatchlist());
    };

    updateWatchlist();
    watchlistManager.on('change', updateWatchlist);
    return () => {
      watchlistManager.off('change', updateWatchlist);
    };
  }, []);

  const handleDeleteClick = (item: WatchlistItem) => {
    setTargetItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (targetItemToDelete) {
      watchlistManager.removeFromWatchlist(targetItemToDelete.symbol);
    }
    setDeleteConfirmVisible(false);
    setTargetItemToDelete(null);
  };

  const moveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const updated = [...watchlist];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    watchlistManager.reorderWatchlist(updated);
  }, [watchlist]);

  // HTML5 Drag and Drop Handlers for Desktop Web Browsers
  const handleDragStart = (e: any, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleDragOver = (e: any) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: any, dropIndex: number) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const updated = [...watchlist];
      const draggedItem = updated[draggedIndex];
      updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, draggedItem);
      watchlistManager.reorderWatchlist(updated);
    }
    setDraggedIndex(null);
  };

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
        renderItem={({ item, index }) => (
          <WatchlistCard 
            item={item}
            index={index}
            onPress={() => navigation.navigate('StockDetail', { symbol: item.symbol, companyName: item.name })}
            onDeletePress={() => handleDeleteClick(item)}
            onMoveUp={() => moveItem(index, 'up')}
            onMoveDown={() => moveItem(index, 'down')}
            isFirst={index === 0}
            isLast={index === watchlist.length - 1}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteConfirmVisible}
        title="Remove from Watchlist"
        message={`Are you sure you want to remove ${targetItemToDelete?.symbol} from your Watchlist?`}
        confirmText="Yes, Remove"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
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
  cardWrapper: { marginVertical: 6 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  dragHandleSection: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 4 },
  dragGripIcon: { fontSize: 16, color: '#9CA3AF', cursor: 'grab' as any },
  reorderControls: { flexDirection: 'column', gap: 2 },
  arrowBtn: { padding: 2 },
  arrowDisabled: { opacity: 0.2 },
  arrowText: { fontSize: 9, color: '#6B7280', fontWeight: '700' },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  symbolText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  nameText: { fontSize: 13, color: '#666', marginTop: 2, maxWidth: 160 },
  priceContainer: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  badge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 8, borderRadius: 20, backgroundColor: '#FEE2E2', marginLeft: 6 },
  deleteBtnIcon: { fontSize: 14 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20 },
});