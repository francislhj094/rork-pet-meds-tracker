import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Plus, Pill, Trash2, TrendingUp, Calendar, Scale } from 'lucide-react-native';
import { usePetMeds, usePetMedications } from '@/providers/PetMedsProvider';
import { formatDate } from '@/utils/dateHelpers';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const chartWidth = width - 80;
const chartHeight = 200;

export default function PetDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pets, deletePet, deleteMedication } = usePetMeds();
  const medications = usePetMedications(id || '');

  const pet = pets.find(p => p.id === id);

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pet not found</Text>
      </View>
    );
  }

  const handleDeletePet = () => {
    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${pet.name}? This will also delete all their medications.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await deletePet(pet.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleDeleteMedication = (medicationId: string, medicationName: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medicationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await deleteMedication(medicationId);
          },
        },
      ]
    );
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const weightHistory = pet.weightHistory || [];
  const hasWeightData = weightHistory.length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: pet.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleDeletePet}>
              <Trash2 size={22} color="#DC2626" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.petHeader}>
            {pet.photoUri ? (
              <Image
                source={{ uri: pet.photoUri }}
                style={styles.petPhoto}
                contentFit="cover"
              />
            ) : (
              <View style={styles.petPhotoPlaceholder}>
                <Text style={styles.petPhotoPlaceholderText}>
                  {pet.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.petName}>{pet.name}</Text>
          </View>

          {(pet.species || pet.breed || pet.birthDate || pet.weight || pet.color) && (
            <View style={styles.infoCard}>
              {pet.species && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Species</Text>
                  <Text style={styles.infoValue}>{pet.species}</Text>
                </View>
              )}
              {pet.breed && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Breed</Text>
                  <Text style={styles.infoValue}>{pet.breed}</Text>
                </View>
              )}
              {pet.birthDate && (
                <View style={styles.infoRow}>
                  <Calendar size={16} color="#6B7280" />
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>
                    {calculateAge(pet.birthDate)} years old
                  </Text>
                </View>
              )}
              {pet.weight && (
                <View style={styles.infoRow}>
                  <Scale size={16} color="#6B7280" />
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{pet.weight} kg</Text>
                </View>
              )}
              {pet.color && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Color</Text>
                  <Text style={styles.infoValue}>{pet.color}</Text>
                </View>
              )}
            </View>
          )}

          {hasWeightData && (
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <TrendingUp size={20} color="#FF6B6B" />
                <Text style={styles.chartTitle}>Weight History</Text>
              </View>
              <WeightChart data={weightHistory} />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Pill size={20} color="#FF6B6B" />
                <Text style={styles.sectionTitle}>Medications</Text>
              </View>
              <TouchableOpacity
                style={styles.addMedButton}
                onPress={() => router.push(`/add-medication?petId=${pet.id}`)}
              >
                <Plus size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            {medications.length === 0 ? (
              <View style={styles.emptyMeds}>
                <Text style={styles.emptyMedsText}>No medications yet</Text>
                <TouchableOpacity
                  style={styles.addFirstMedButton}
                  onPress={() => router.push(`/add-medication?petId=${pet.id}`)}
                >
                  <Text style={styles.addFirstMedButtonText}>Add First Medication</Text>
                </TouchableOpacity>
              </View>
            ) : (
              medications.map(med => (
                <TouchableOpacity
                  key={med.id}
                  style={styles.medCard}
                  onPress={() => router.push(`/medication/${med.id}`)}
                >
                  <View style={styles.medCardContent}>
                    <View style={styles.medInfo}>
                      <Text style={styles.medName}>{med.name}</Text>
                      <Text style={styles.medDosage}>{med.dosage}</Text>
                      <Text style={styles.medSchedule}>Every {med.schedule.toLowerCase()}</Text>
                      <Text style={styles.medNextDue}>
                        Next due: {formatDate(med.nextDue)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteMedButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteMedication(med.id, med.name);
                      }}
                    >
                      <Trash2 size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

interface WeightChartProps {
  data: { date: string; weight: number }[];
}

function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sortedData.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const weightRange = maxWeight - minWeight || 1;

  const points = sortedData.map((entry, index) => {
    const x = (index / (sortedData.length - 1 || 1)) * chartWidth + 20;
    const y = chartHeight - 40 - ((entry.weight - minWeight) / weightRange) * (chartHeight - 60);
    return { x, y, weight: entry.weight, date: entry.date };
  });

  return (
    <View style={styles.chart}>
      <View style={styles.chartYAxis}>
        <Text style={styles.chartAxisLabel}>{maxWeight.toFixed(1)}</Text>
        <Text style={styles.chartAxisLabel}>{((maxWeight + minWeight) / 2).toFixed(1)}</Text>
        <Text style={styles.chartAxisLabel}>{minWeight.toFixed(1)}</Text>
      </View>
      <View style={styles.chartArea}>
        <View style={styles.gridLines}>
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
        </View>
        <View style={{ width: chartWidth + 40, height: chartHeight }}>
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.chartPoint,
                { left: point.x, top: point.y }
              ]}
            >
              <View style={styles.chartDot} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  petHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  petPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  petPhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  petPhotoPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  petName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  chart: {
    flexDirection: 'row',
    height: chartHeight,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingVertical: 20,
    width: 40,
  },
  chartAxisLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20,
    bottom: 40,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  chartPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
  },
  chartDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addMedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medInfo: {
    flex: 1,
    gap: 4,
  },
  medName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  medDosage: {
    fontSize: 14,
    color: '#6B7280',
  },
  medSchedule: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  medNextDue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 4,
  },
  deleteMedButton: {
    padding: 8,
  },
  emptyMeds: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyMedsText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  addFirstMedButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstMedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 40,
  },
});
