import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Clock, Filter } from 'lucide-react-native';
import { usePetMeds } from '@/providers/PetMedsProvider';
import { LinearGradient } from 'expo-linear-gradient';

export default function MedicationHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { logs, medications, pets } = usePetMeds();
  const [selectedPet, setSelectedPet] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7' | '30' | 'all'>('30');

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (dateRange === '7') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (dateRange === '30') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    return logs
      .filter(log => {
        const logDate = new Date(log.givenAt);
        const inRange = dateRange === 'all' || logDate >= cutoffDate;
        
        if (!inRange) return false;

        if (selectedPet === 'all') return true;

        const med = medications.find(m => m.id === log.medicationId);
        return med && med.petId === selectedPet;
      })
      .sort((a, b) => new Date(b.givenAt).getTime() - new Date(a.givenAt).getTime())
      .map(log => {
        const med = medications.find(m => m.id === log.medicationId);
        const pet = med ? pets.find(p => p.id === med.petId) : null;
        return {
          ...log,
          medicationName: med?.name || 'Unknown Medication',
          petName: pet?.name || 'Unknown Pet',
          dosage: med?.dosage,
        };
      });
  }, [logs, medications, pets, selectedPet, dateRange]);

  return (
    <>
      <Stack.Screen options={{ title: 'Medication History' }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSubtitle}>
            {filteredLogs.length} {filteredLogs.length === 1 ? 'dose' : 'doses'} given
          </Text>
        </LinearGradient>

        <View style={styles.filters}>
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Filter size={16} color="#6B7280" />
              <Text style={styles.filterLabel}>Pet</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[styles.filterButton, selectedPet === 'all' && styles.filterButtonActive]}
                  onPress={() => setSelectedPet('all')}
                >
                  <Text style={[styles.filterButtonText, selectedPet === 'all' && styles.filterButtonTextActive]}>
                    All Pets
                  </Text>
                </TouchableOpacity>
                {pets.map(pet => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[styles.filterButton, selectedPet === pet.id && styles.filterButtonActive]}
                    onPress={() => setSelectedPet(pet.id)}
                  >
                    <Text style={[styles.filterButtonText, selectedPet === pet.id && styles.filterButtonTextActive]}>
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.filterLabel}>Period</Text>
            </View>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterButton, dateRange === '7' && styles.filterButtonActive]}
                onPress={() => setDateRange('7')}
              >
                <Text style={[styles.filterButtonText, dateRange === '7' && styles.filterButtonTextActive]}>
                  Last 7 days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, dateRange === '30' && styles.filterButtonActive]}
                onPress={() => setDateRange('30')}
              >
                <Text style={[styles.filterButtonText, dateRange === '30' && styles.filterButtonTextActive]}>
                  Last 30 days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, dateRange === 'all' && styles.filterButtonActive]}
                onPress={() => setDateRange('all')}
              >
                <Text style={[styles.filterButtonText, dateRange === 'all' && styles.filterButtonTextActive]}>
                  All time
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No history found</Text>
              <Text style={styles.emptyText}>
                Medication doses will appear here once given
              </Text>
            </View>
          ) : (
            filteredLogs.map(log => (
              <View key={`${log.medicationId}-${log.givenAt}`} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.petName}>{log.petName}</Text>
                  <Text style={styles.date}>
                    {new Date(log.givenAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.medicationName}>{log.medicationName}</Text>
                {log.dosage && <Text style={styles.dosage}>{log.dosage}</Text>}
                <View style={styles.logFooter}>
                  <Text style={styles.time}>
                    {new Date(log.givenAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {log.administeredBy && (
                    <Text style={styles.administeredBy}>by {log.administeredBy}</Text>
                  )}
                </View>
                {log.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notes}>{log.notes}</Text>
                  </View>
                )}
              </View>
            ))
          )}
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
  filters: {
    padding: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSection: {
    gap: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  administeredBy: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#1F2937',
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
