import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Right } from "../assets/index.js";
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  'Track who owes you and who you owe',
  'Multiple records for each person',
  'Smart summaries',
  'Backup & secure',
];

const Welcome = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const featureAnimValues = useRef(
    FEATURES.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-40),
    }))
  ).current;

  const bottomAnimY = useRef(new Animated.Value(40)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo Spring Entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Title & Tagline Entrance
    Animated.parallel([
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Staggered Features Entrance
    const featureAnimations = featureAnimValues.map((anim) => {
      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(anim.translateX, {
          toValue: 0,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(150, featureAnimations).start();

    // 4. Bottom Illustration & Buttons Entrance
    Animated.parallel([
      Animated.timing(bottomAnimY, {
        toValue: 0,
        duration: 600,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.timing(bottomOpacity, {
        toValue: 1,
        duration: 600,
        delay: 800,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardContainer}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Title & Tagline */}
        <Animated.View
          style={[
            styles.headerTextContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.primary }]}>Khata</Text>
        </Animated.View>

        {/* Animated Features List */}
        <View style={styles.featuresList}>
          {FEATURES.map((item, index) => (
            <Animated.View
              key={index}
              style={[
                styles.featureRow,
                {
                  opacity: featureAnimValues[index].opacity,
                  transform: [
                    { translateX: featureAnimValues[index].translateX },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.checkBadge,
                  {
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Text style={[styles.checkIcon, { color: theme.primary }]}>✓</Text>
              </View>
              <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                {item}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Animated Bottom Section with Action Buttons */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: bottomOpacity,
              transform: [{ translateY: bottomAnimY }],
            },
          ]}
        >
          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: theme.primary,
                    shadowColor: theme.primary,
                  },
                ]}
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => navigation.navigate('register')}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Right width={16} height={16} fill="white" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

export default Welcome;

const getStyles = (theme) => StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
    width: 90,
    height: 90,
    borderRadius: 22,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  featuresList: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkIcon: {
    fontSize: 13,
    fontWeight: '900',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
});
