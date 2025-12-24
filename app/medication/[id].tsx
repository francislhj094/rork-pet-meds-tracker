import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Trash2, Calendar, Package, AlertCircle } from 'lucide-react-native';
import { usePetMeds } from '@/providers/PetMedsProvider';
import { formatDate } from '@/utils/dateHelpers';
import * as Haptics from 'expo-haptics';

export default function MedicationDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { medications, pets, deleteMedication } = usePetMeds();

  const medication = medications.find(m => m.id === id);
  const pet = medication ? pets.find(p => p.id === medication.petId) : null;

  if (!medication || !pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Medication not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medication.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await deleteMedication(medication.id);
            router.back();
          },
        },
      ]
    );
  };

  const daysUntilRefill = medication.remainingQuantity && medication.frequency 
    ? Math.floor(medication.remainingQuantity / parseFloat(medication.frequency || '1'))
    : null;

  const showRefillWarning = daysUntilRefill !== null && daysUntilRefill <= 7;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Medication Details',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleDelete}
            >
              <Trash2 size={22} color="#DC2626" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.petSection}>
            <Text style={styles.label}>Pet</Text>
            <Text style={styles.petName}>{pet.name}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dosage</Text>
              <Text style={styles.infoValue}>{medication.dosage}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Frequency</Text>
              <Text style={styles.infoValue}>Every {medication.schedule.toLowerCase()}</Text>
            </View>

            {medication.reminderTime && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reminder Time</Text>
                <Text style={styles.infoValue}>{medication.reminderTime}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.dateSection}>
              <Calendar size={20} color="#FF6B6B" />
              <View style={styles.dateInfo}>
                {medication.startDate && (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Start Date:</Text>
                    <Text style={styles.dateValue}>{formatDate(medication.startDate)}</Text>
                  </View>
                )}
                <View style={styles.dateRow}>
                  <Text style={styles.dateLabel}>Next Due:</Text>
                  <Text style={[styles.dateValue, styles.dateDue]}>{formatDate(medication.nextDue)}</Text>
                </View>
                {medication.lastGiven && (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Last Given:</Text>
                    <Text style={styles.dateValue}>{formatDate(medication.lastGiven)}</Text>
                  </View>
                )}
                {medication.endDate && (
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>End Date:</Text>
                    <Text style={styles.dateValue}>{formatDate(medication.endDate)}</Text>
                  </View>
                )}
              </View>
            </View>

            {medication.remainingQuantity !== undefined && (
              <>
                <View style={styles.divider} />
                <View style={styles.inventorySection}>
                  <Package size={20} color="#FF6B6B" />
                  <View style={styles.inventoryInfo}>
                    <View style={styles.inventoryRow}>
                      <Text style={styles.inventoryLabel}>Remaining Quantity:</Text>
                      <Text style={styles.inventoryValue}>{medication.remainingQuantity}</Text>
                    </View>
                    {daysUntilRefill !== null && (
                      <View style={styles.inventoryRow}>
                        <Text style={styles.inventoryLabel}>Days Until Refill:</Text>
                        <Text style={styles.inventoryValue}>{daysUntilRefill} days</Text>
                      </View>
                    )}
                  </View>
                </View>
              </>
            )}

            {showRefillWarning && (
              <View style={styles.warningCard}>
                <AlertCircle size={20} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Refill needed soon! Only {daysUntilRefill} days remaining
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
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
  headerButton: {
    padding: 4,
  },
  petSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  dateSection: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInfo: {
    flex: 1,
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateDue: {
    color: '#FF6B6B',
  },
  inventorySection: {
    flexDirection: 'row',
    gap: 12,
  },
  inventoryInfo: {
    flex: 1,
    gap: 8,
  },
  inventoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inventoryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  inventoryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 40,
  },
});
