import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#10B981', // Emerald
  '#34D399', // Bright green
  '#FBBF24', // Amber gold
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  isCircle: boolean;
  startX: number;
  targetX: number;
  targetY: number;
  duration: number;
}

export function ConfettiView({ count = 50 }: { count?: number }) {
  const particles = useRef<Particle[]>([]);

  if (particles.current.length === 0) {
    const originX = SCREEN_WIDTH / 2;
    const originY = SCREEN_HEIGHT * 0.25;

    particles.current = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const distance = 80 + Math.random() * (SCREEN_WIDTH * 0.6);
      const targetX = originX + Math.cos(angle) * distance;
      const targetY = originY + Math.sin(angle) * distance + 200 + Math.random() * 300;

      return {
        id: i,
        x: new Animated.Value(originX),
        y: new Animated.Value(originY),
        rotate: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.floor(Math.random() * 8),
        isCircle: Math.random() > 0.5,
        startX: originX,
        targetX,
        targetY,
        duration: 2200 + Math.random() * 1200,
      };
    });
  }

  useEffect(() => {
    const animations = particles.current.map((p) => {
      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: p.targetX,
          duration: p.duration,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: p.targetY,
          duration: p.duration,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 5),
          duration: p.duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(p.scale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0.8,
            duration: p.duration * 0.7,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(p.duration * 0.6),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: p.duration * 0.4,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.stagger(15, animations).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.current.map((p) => {
        const spin = p.rotate.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-3600deg', '3600deg'],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.isCircle ? p.size : p.size * 1.5,
                borderRadius: p.isCircle ? p.size / 2 : 2,
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { rotate: spin },
                  { scale: p.scale },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
