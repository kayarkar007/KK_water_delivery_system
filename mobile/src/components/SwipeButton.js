import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, TYPOGRAPHY, SPACING } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.6;

const SwipeButton = ({ 
  title = 'Swipe to Confirm', 
  onSwipe, 
  color = COLORS.success,
  icon = 'chevron-forward',
  disabled = false,
  height = 60,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const maxSlide = SCREEN_WIDTH - 100;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= maxSlide) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SWIPE_THRESHOLD) {
          // Complete swipe
          Animated.spring(translateX, {
            toValue: maxSlide,
            useNativeDriver: true,
            bounciness: 4,
          }).start(() => {
            if (onSwipe) onSwipe();
            // Reset after callback
            setTimeout(() => {
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }, 500);
          });
        } else {
          // Snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const opacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const bgOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 0.3],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { height }, disabled && styles.disabled]}>
      {/* Track background */}
      <View style={[styles.track, { backgroundColor: color + '20', borderColor: color + '40' }]}>
        {/* Animated fill */}
        <Animated.View 
          style={[
            styles.trackFill, 
            { backgroundColor: color, opacity: bgOpacity }
          ]} 
        />
        {/* Hint text */}
        <Animated.Text style={[styles.hintText, { opacity }]}>
          {title}
        </Animated.Text>
        {/* Animated arrows */}
        <Animated.View style={[styles.arrowContainer, { opacity }]}>
          <Ionicons name="chevron-forward" size={16} color={color + '60'} />
          <Ionicons name="chevron-forward" size={16} color={color + '80'} />
          <Ionicons name="chevron-forward" size={16} color={color} />
        </Animated.View>
      </View>

      {/* Swipe thumb */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            backgroundColor: color,
            height: height - 8,
            width: height - 8,
            borderRadius: (height - 8) / 2,
            transform: [{ translateX }],
          },
        ]}
      >
        <Ionicons name={icon} size={24} color={COLORS.white} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    flex: 1,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  trackFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.full,
  },
  hintText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.medium,
    marginLeft: 40,
  },
  arrowContainer: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default SwipeButton;
