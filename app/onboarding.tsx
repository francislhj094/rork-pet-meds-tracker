import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, Bell, Calendar, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const onboardingScreens = [
  {
    icon: Heart,
    title: 'Track Your Pets',
    description: 'Add your pets and manage all their medications in one place',
    color: '#FF6B6B',
  },
  {
    icon: Bell,
    title: 'Never Miss a Dose',
    description: 'Get timely reminders 15 minutes before each medication is due',
    color: '#10B981',
  },
  {
    icon: Calendar,
    title: 'Stay Organized',
    description: 'View your medication schedule and track completion history',
    color: '#3B82F6',
  },
  {
    icon: CheckCircle,
    title: 'Simple & Easy',
    description: 'Just tap to mark medications as given. It\'s that simple!',
    color: '#F59E0B',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < onboardingScreens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)');
  };

  const screen = onboardingScreens[currentIndex];
  const IconComponent = screen.icon;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[screen.color, `${screen.color}DD`]}
        style={[styles.content, { paddingTop: insets.top + 40 }]}
      >
        {currentIndex < onboardingScreens.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        <View style={styles.iconContainer}>
          <IconComponent size={80} color="#FFFFFF" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>{screen.title}</Text>
        <Text style={styles.description}>{screen.description}</Text>

        <View style={styles.pagination}>
          {onboardingScreens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex < onboardingScreens.length - 1 ? 'Next' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 60,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  activeDot: {
    width: 24,
    opacity: 1,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
});
