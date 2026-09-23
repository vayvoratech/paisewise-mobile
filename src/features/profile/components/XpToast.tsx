import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';

export interface XpToastProps {
  visible: boolean;
  xpAmount: number;
  message?: string;
  onDismiss: () => void;
}

export const XpToast: React.FC<XpToastProps> = ({
  visible,
  xpAmount,
  message = 'Achievement Unlocked!',
  onDismiss,
}) => {
  const slideAnim = React.useRef(new Animated.Value(-80)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity style={styles.toastCard} activeOpacity={0.9} onPress={hideToast}>
        <View style={styles.starBadge}>
          <Text style={styles.starIcon}>⭐</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.xpText}>+{xpAmount} XP EARNED!</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#818CF8',
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    width: '100%',
    maxWidth: 400,
  },
  starBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  starIcon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  xpText: {
    ...typography.h3,
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 15,
  },
  messageText: {
    ...typography.caption,
    color: '#E0E7FF',
    marginTop: 2,
  },
  closeIcon: {
    fontSize: 16,
    color: '#A5B4FC',
    paddingLeft: spacing.sm,
  },
});
