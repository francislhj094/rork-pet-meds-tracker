import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { usePetMeds } from '@/providers/PetMedsProvider';
import { Medication, ScheduleType } from '@/types';
import { ChevronDown, ScanLine } from 'lucide-react-native';

const SCHEDULES: ScheduleType[] = ['Daily', 'Weekly', 'Monthly', 'Every 3 Months', 'Every 6 Months', 'Yearly'];

export default function AddMedicationScreen() {
  const insets = useSafeAreaInsets();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { addMedication, pets } = usePetMeds();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [schedule, setSchedule] = useState<ScheduleType>('Monthly');
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const pet = pets.find(p => p.id === petId);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter the medication name.');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Missing Information', 'Please enter the dosage.');
      return;
    }

    if (!petId) {
      Alert.alert('Error', 'No pet selected.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newMedication: Medication = {
      id: Date.now().toString(),
      petId,
      name: name.trim(),
      dosage: dosage.trim(),
      schedule,
      nextDue: today,
    };

    try {
      await addMedication(newMedication);
      router.back();
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        {pet && (
          <View style={styles.petInfo}>
            <Text style={styles.petInfoLabel}>Adding medication for</Text>
            <Text style={styles.petInfoName}>{pet.name}</Text>
          </View>
        )}

        <View style={styles.form}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push(`/scan-barcode?petId=${petId}`)}
          >
            <ScanLine size={20} color="#FF6B6B" />
            <Text style={styles.scanButtonText}>Scan Barcode</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medication Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Heartgard Plus"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosage *</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 1 chew"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Schedule *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowSchedulePicker(!showSchedulePicker)}
            >
              <Text style={styles.selectButtonText}>{schedule}</Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            {showSchedulePicker && (
              <View style={styles.picker}>
                {SCHEDULES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.pickerOption,
                      s === schedule && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setSchedule(s);
                      setShowSchedulePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        s === schedule && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  petInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  petInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  petInfoName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionSelected: {
    backgroundColor: '#FEF2F2',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  pickerOptionTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scanButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
