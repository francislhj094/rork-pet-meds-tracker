import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react-native';
import { usePetMeds } from '@/providers/PetMedsProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { medications, pets, logs } = usePetMeds();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate);

  const getMedicationsForDate = useMemo(() => {
    return (date: Date) => {
      const dateString = date.toISOString().split('T')[0];
      return medications.filter(med => {
        const medDate = new Date(med.nextDue);
        const medDateString = medDate.toISOString().split('T')[0];
        return medDateString === dateString;
      });
    };
  }, [medications]);

  const getCompletedForDate = useMemo(() => {
    return (date: Date) => {
      const dateString = date.toISOString().split('T')[0];
      return logs.filter(log => {
        const logDate = new Date(log.givenAt);
        const logDateString = logDate.toISOString().split('T')[0];
        return logDateString === dateString;
      });
    };
  }, [logs]);

  const getMissedForDate = useMemo(() => {
    return (date: Date) => {
      const today = new Date().toISOString().split('T')[0];
      const dateString = date.toISOString().split('T')[0];
      
      if (dateString >= today) return [];
      
      const dueMeds = medications.filter(med => {
        const lastGiven = med.lastGiven ? new Date(med.lastGiven).toISOString().split('T')[0] : null;
        const nextDue = new Date(med.nextDue).toISOString().split('T')[0];
        return nextDue === dateString && (!lastGiven || lastGiven < dateString);
      });
      
      const completedLogs = logs.filter(log => {
        const logDate = new Date(log.givenAt);
        const logDateString = logDate.toISOString().split('T')[0];
        return logDateString === dateString;
      });
      const completedIds = completedLogs.map(log => log.medicationId);
      
      return dueMeds.filter(med => !completedIds.includes(med.id));
    };
  }, [medications, logs]);

  const previousMonth = () => {
    setSelectedDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(year, month + 1, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);

  const selectedDayMeds = useMemo(() => {
    if (!selectedDayDate) return [];
    return getMedicationsForDate(selectedDayDate).map(med => {
      const pet = pets.find(p => p.id === med.petId);
      return { ...med, petName: pet?.name || 'Unknown' };
    });
  }, [selectedDayDate, getMedicationsForDate, pets]);

  const selectedDayCompleted = useMemo(() => {
    if (!selectedDayDate) return [];
    return getCompletedForDate(selectedDayDate);
  }, [selectedDayDate, getCompletedForDate]);

  const selectedDayMissed = useMemo(() => {
    if (!selectedDayDate) return [];
    return getMissedForDate(selectedDayDate).map(med => {
      const pet = pets.find(p => p.id === med.petId);
      return { ...med, petName: pet?.name || 'Unknown' };
    });
  }, [selectedDayDate, getMissedForDate, pets]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>Track medication schedule</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={previousMonth} style={styles.monthButton}>
              <ChevronLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthButton}>
              <ChevronRight size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <View style={styles.dayNamesRow}>
            {dayNames.map(day => (
              <Text key={day} style={styles.dayName}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const completed = getCompletedForDate(date);
              const missed = getMissedForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = selectedDayDate?.toDateString() === date.toDateString();

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    isSelected && styles.selectedCell,
                  ]}
                  onPress={() => setSelectedDayDate(date)}
                >
                  <Text style={[
                    styles.dayNumber,
                    isToday && styles.todayNumber,
                    isSelected && styles.selectedNumber,
                  ]}>
                    {day}
                  </Text>
                  <View style={styles.indicators}>
                    {completed.length > 0 && (
                      <View style={styles.completedIndicator} />
                    )}
                    {missed.length > 0 && (
                      <View style={styles.missedIndicator} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {selectedDayDate && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>
              {selectedDayDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>

            {selectedDayMeds.length === 0 && selectedDayCompleted.length === 0 && selectedDayMissed.length === 0 ? (
              <Text style={styles.noMedsText}>No medications scheduled</Text>
            ) : (
              <>
                {selectedDayCompleted.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle2 size={18} color="#10B981" />
                      <Text style={styles.sectionTitle}>Completed</Text>
                    </View>
                    {selectedDayCompleted.map(log => {
                      const med = medications.find(m => m.id === log.medicationId);
                      const pet = med ? pets.find(p => p.id === med.petId) : null;
                      if (!med || !pet) return null;
                      return (
                        <TouchableOpacity
                          key={log.givenAt}
                          style={styles.medItem}
                          onPress={() => router.push(`/medication/${med.id}`)}
                        >
                          <Text style={styles.medPetName}>{pet.name}</Text>
                          <Text style={styles.medName}>{med.name}</Text>
                          <Text style={styles.medTime}>
                            {new Date(log.givenAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {selectedDayMissed.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <XCircle size={18} color="#DC2626" />
                      <Text style={styles.sectionTitle}>Missed</Text>
                    </View>
                    {selectedDayMissed.map(med => (
                      <TouchableOpacity
                        key={med.id}
                        style={[styles.medItem, styles.missedItem]}
                        onPress={() => router.push(`/medication/${med.id}`)}
                      >
                        <Text style={styles.medPetName}>{med.petName}</Text>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medDosage}>{med.dosage}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {selectedDayMeds.length > 0 && selectedDayDate.toDateString() >= new Date().toDateString() && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Scheduled</Text>
                    </View>
                    {selectedDayMeds.map(med => (
                      <TouchableOpacity
                        key={med.id}
                        style={styles.medItem}
                        onPress={() => router.push(`/medication/${med.id}`)}
                      >
                        <Text style={styles.medPetName}>{med.petName}</Text>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medDosage}>{med.dosage}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
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
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  todayNumber: {
    color: '#FF6B6B',
  },
  selectedNumber: {
    color: '#FFFFFF',
  },
  indicators: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  completedIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  missedIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DC2626',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  noMedsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  medItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  missedItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  medPetName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  medDosage: {
    fontSize: 14,
    color: '#6B7280',
  },
  medTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
