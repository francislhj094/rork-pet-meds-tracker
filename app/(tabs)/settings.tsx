import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Bell, Moon, Database, Download, Info, ChevronRight, History } from 'lucide-react-native';
import { usePetMeds } from '@/providers/PetMedsProvider';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { pets, medications, logs } = usePetMeds();

  const handleBackup = async () => {
    try {
      const backupData = {
        pets,
        medications,
        logs,
        timestamp: new Date().toISOString(),
      };

      const jsonData = JSON.stringify(backupData, null, 2);
      
      if (Platform.OS === 'web') {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `petmeds-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Backup downloaded successfully');
      } else {
        Alert.alert(
          'Backup Data',
          `Backup data:\n\n${pets.length} pets\n${medications.length} medications\n${logs.length} doses\n\nBackup JSON has been prepared. In a production app, this would be saved to device storage.`
        );
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Error', 'Failed to create backup');
    }
  };

  const handleExport = async () => {
    try {
      const reportData = medications.map(med => {
        const pet = pets.find(p => p.id === med.petId);
        const medLogs = logs.filter(log => log.medicationId === med.id);
        
        return {
          pet: pet?.name || 'Unknown',
          medication: med.name,
          dosage: med.dosage,
          schedule: med.schedule,
          lastGiven: med.lastGiven || 'Never',
          nextDue: med.nextDue,
          totalDosesGiven: medLogs.length,
        };
      });

      const csvHeader = 'Pet,Medication,Dosage,Schedule,Last Given,Next Due,Total Doses\n';
      const csvRows = reportData.map(row => 
        `${row.pet},${row.medication},${row.dosage},${row.schedule},${row.lastGiven},${row.nextDue},${row.totalDosesGiven}`
      ).join('\n');
      
      const csvData = csvHeader + csvRows;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `petmeds-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Report exported successfully');
      } else {
        Alert.alert(
          'Export Report',
          `Report generated with ${reportData.length} medications. In a production app, this CSV would be saved and shared.`
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export report');
    }
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Data',
      'This feature requires selecting a backup file. Would you like to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Alert.alert('Not Implemented', 'File picker functionality would be implemented here');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Notifications',
                  'Notification settings would be managed here. You can enable/disable reminders for medications.'
                );
              }}
            >
              <View style={styles.settingLeft}>
                <Bell size={20} color="#FF6B6B" />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Text style={styles.settingValue}>On</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert('Coming Soon', 'Dark mode will be available in a future update');
              }}
            >
              <View style={styles.settingLeft}>
                <Moon size={20} color="#FF6B6B" />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Text style={styles.settingValue}>Off</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleBackup}
            >
              <View style={styles.settingLeft}>
                <Database size={20} color="#FF6B6B" />
                <Text style={styles.settingLabel}>Backup Data</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleRestore}
            >
              <View style={styles.settingLeft}>
                <Download size={20} color="#FF6B6B" />
                <Text style={styles.settingLabel}>Restore Data</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleExport}
            >
              <View style={styles.settingLeft}>
                <Download size={20} color="#FF6B6B" />
                <Text style={styles.settingLabel}>Export Report</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/history')}
            >
              <View style={styles.settingLeft}>
                <History size={20} color="#FF6B6B" />
                <Text style={styles.settingLabel}>View Medication History</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  'Pet Meds',
                  'Version 1.0.0\n\nA simple medication tracker for your pets.\n\nMade with ❤️ for pet owners.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.settingLeft}>
                <Info size={20} color="#FF6B6B" />
                <Text style={styles.settingLabel}>About & Help</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <Text style={styles.statsTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{pets.length}</Text>
                <Text style={styles.statLabel}>Pets</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{medications.length}</Text>
                <Text style={styles.statLabel}>Medications</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{logs.length}</Text>
                <Text style={styles.statLabel}>Doses Given</Text>
              </View>
            </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  stats: {
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});
