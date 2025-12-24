import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ChevronRight } from 'lucide-react-native';
import { usePetMeds, usePetMedications } from '@/providers/PetMedsProvider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function PetsScreen() {
  const insets = useSafeAreaInsets();
  const { pets } = usePetMeds();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Pets</Text>
            <Text style={styles.headerSubtitle}>
              {pets.length} {pets.length === 1 ? 'pet' : 'pets'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-pet')}
          >
            <Plus size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyTitle}>No pets yet</Text>
            <Text style={styles.emptyText}>
              Add your first pet to start tracking their medications
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-pet')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Pet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pets.map(pet => <PetCard key={pet.id} pet={pet} />)
        )}
      </ScrollView>
    </View>
  );
}

function PetCard({ pet }: { pet: any }) {
  const medications = usePetMedications(pet.id);

  return (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => router.push(`/pet/${pet.id}`)}
    >
      <View style={styles.petCardContent}>
        {pet.photoUri ? (
          <Image
            source={{ uri: pet.photoUri }}
            style={styles.petCardPhoto}
            contentFit="cover"
          />
        ) : (
          <View style={styles.petCardPhotoPlaceholder}>
            <Text style={styles.petCardPhotoPlaceholderText}>
              {pet.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.petCardInfo}>
          <Text style={styles.petCardName}>{pet.name}</Text>
          <Text style={styles.petCardMeds}>
            {medications.length} {medications.length === 1 ? 'medication' : 'medications'}
          </Text>
        </View>
        <ChevronRight size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.95,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petCardPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  petCardPhotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petCardPhotoPlaceholderText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  petCardInfo: {
    flex: 1,
    gap: 4,
  },
  petCardName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  petCardMeds: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
