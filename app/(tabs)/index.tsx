import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react-native';
import { usePetMeds, useTodayMedications } from '@/providers/PetMedsProvider';
import { isPastDue, isToday } from '@/utils/dateHelpers';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { markMedicationGiven, isMarkingGiven, pets } = usePetMeds();
  const todayMedications = useTodayMedications();

  const handleMarkGiven = async (medicationId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markMedicationGiven(medicationId);
  };

  const overdueMeds = todayMedications.filter(med => isPastDue(med.nextDue));
  const todayMeds = todayMedications.filter(med => isToday(med.nextDue));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Today&apos;s Medications</Text>
        <Text style={styles.headerSubtitle}>
          {todayMedications.length === 0 ? 'All caught up! 🎉' : `${todayMedications.length} medication${todayMedications.length !== 1 ? 's' : ''} due`}
        </Text>
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
            <Text style={styles.emptyText}>Add your first pet to start tracking their medications</Text>
          </View>
        ) : todayMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>All clear!</Text>
            <Text style={styles.emptyText}>No medications due today. Your pets are all set!</Text>
          </View>
        ) : (
          <>
            {overdueMeds.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AlertCircle size={20} color="#DC2626" />
                  <Text style={styles.sectionTitle}>Overdue</Text>
                </View>
                {overdueMeds.map(med => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    onMarkGiven={handleMarkGiven}
                    isMarking={isMarkingGiven}
                    isOverdue={true}
                  />
                ))}
              </View>
            )}

            {todayMeds.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <CheckCircle2 size={20} color="#4B5563" />
                  <Text style={styles.sectionTitle}>Due Today</Text>
                </View>
                {todayMeds.map(med => (
                  <MedicationCard
                    key={med.id}
                    medication={med}
                    onMarkGiven={handleMarkGiven}
                    isMarking={isMarkingGiven}
                    isOverdue={false}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

interface MedicationCardProps {
  medication: any;
  onMarkGiven: (id: string) => Promise<void>;
  isMarking: boolean;
  isOverdue: boolean;
}

function MedicationCard({ medication, onMarkGiven, isMarking, isOverdue }: MedicationCardProps) {
  return (
    <View style={[styles.card, isOverdue && styles.cardOverdue]}>
      <View style={styles.cardContent}>
        <View style={styles.petInfo}>
          {medication.petPhoto ? (
            <Image
              source={{ uri: medication.petPhoto }}
              style={styles.petPhoto}
              contentFit="cover"
            />
          ) : (
            <View style={styles.petPhotoPlaceholder}>
              <Text style={styles.petPhotoPlaceholderText}>
                {medication.petName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.medInfo}>
            <Text style={styles.petName}>{medication.petName}</Text>
            <Text style={styles.medName}>{medication.name}</Text>
            <Text style={styles.dosage}>{medication.dosage}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => onMarkGiven(medication.id)}
          disabled={isMarking}
        >
          {isMarking ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <Circle size={32} color="#FF6B6B" strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
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
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  petPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  petPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petPhotoPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  medInfo: {
    flex: 1,
    gap: 2,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  medName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  dosage: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  checkButton: {
    padding: 8,
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
  },
});
