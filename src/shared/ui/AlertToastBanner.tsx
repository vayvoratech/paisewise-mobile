import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { watchlistManager, PriceAlertItem } from '../../features/watchlist/watchlistManager';

export interface TriggeredAlertPayload {
  alert: PriceAlertItem;
  currentPrice: number;
}

export const AlertToastBanner: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<TriggeredAlertPayload | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const handleTriggeredAlert = (payload: TriggeredAlertPayload) => {
      setActiveNotification(payload);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        dismissNotification();
      }, 6000);

      return () => clearTimeout(timer);
    };

    watchlistManager.on('alert_triggered', handleTriggeredAlert as any);
    return () => {
      watchlistManager.off('alert_triggered', handleTriggeredAlert as any);
    };
  }, []);

  const dismissNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setActiveNotification(null);
    });
  };

  if (!activeNotification) return null;

  const { alert, currentPrice } = activeNotification;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>🔔</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>PRICE ALERT TRIGGERED!</Text>
          <Text style={styles.message}>
            <Text style={styles.bold}>{alert.symbol}</Text> hit{' '}
            <Text style={styles.price}>₹{currentPrice.toFixed(2)}</Text> (Target: ₹{alert.targetPrice.toFixed(2)})
          </Text>
        </View>
        <TouchableOpacity onPress={dismissNotification} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  message: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  bold: {
    fontWeight: '700',
  },
  price: {
    color: '#4ADE80',
    fontWeight: '700',
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
});
