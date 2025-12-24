import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pet, Medication, MedicationLog } from '@/types';
import { calculateNextDueDate } from '@/utils/dateHelpers';
import { scheduleAllMedicationNotifications } from '@/utils/notifications';
import { useEffect } from 'react';

const PETS_KEY = 'pet_meds_pets';
const MEDICATIONS_KEY = 'pet_meds_medications';
const LOGS_KEY = 'pet_meds_logs';

export const [PetMedsProvider, usePetMeds] = createContextHook(() => {
  const queryClient = useQueryClient();

  const pets = useQuery({
    queryKey: ['pets'],
    queryFn: async (): Promise<Pet[]> => {
      const stored = await AsyncStorage.getItem(PETS_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const medications = useQuery({
    queryKey: ['medications'],
    queryFn: async (): Promise<Medication[]> => {
      const stored = await AsyncStorage.getItem(MEDICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  useEffect(() => {
    if (medications.data && pets.data) {
      scheduleAllMedicationNotifications(medications.data, pets.data);
    }
  }, [medications.data, pets.data]);

  const petsQuery = pets;
  const medicationsQuery = medications;

  const logsQuery = useQuery({
    queryKey: ['logs'],
    queryFn: async (): Promise<MedicationLog[]> => {
      const stored = await AsyncStorage.getItem(LOGS_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const addPetMutation = useMutation({
    mutationFn: async (pet: Pet) => {
      const petsData = petsQuery.data || [];
      const updated = [...petsData, pet];
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async (pet: Pet) => {
      const petsData = petsQuery.data || [];
      const updated = petsData.map(p => p.id === pet.id ? pet : p);
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: async (petId: string) => {
      const petsData = petsQuery.data || [];
      const medsData = medicationsQuery.data || [];
      const updatedPets = petsData.filter(p => p.id !== petId);
      const updatedMeds = medsData.filter(m => m.petId !== petId);
      await AsyncStorage.setItem(PETS_KEY, JSON.stringify(updatedPets));
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updatedMeds));
      return { pets: updatedPets, medications: updatedMeds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (medication: Medication) => {
      const medsData = medicationsQuery.data || [];
      const updated = [...medsData, medication];
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async (medication: Medication) => {
      const medsData = medicationsQuery.data || [];
      const updated = medsData.map(m => m.id === medication.id ? medication : m);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (medicationId: string) => {
      const medsData = medicationsQuery.data || [];
      const updated = medsData.filter(m => m.id !== medicationId);
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  const markMedicationGivenMutation = useMutation({
    mutationFn: async (medicationId: string) => {
      const medsData = medicationsQuery.data || [];
      const logsData = logsQuery.data || [];
      const medication = medsData.find(m => m.id === medicationId);
      
      if (!medication) throw new Error('Medication not found');
      
      const now = new Date().toISOString();
      const today = now.split('T')[0];
      
      const updatedMedication: Medication = {
        ...medication,
        lastGiven: today,
        nextDue: calculateNextDueDate(today, medication.schedule),
      };
      
      const updatedMedications = medsData.map(m => 
        m.id === medicationId ? updatedMedication : m
      );
      
      const newLog: MedicationLog = {
        medicationId,
        givenAt: now,
      };
      
      const updatedLogs = [...logsData, newLog];
      
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(updatedMedications));
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
      
      return { medications: updatedMedications, logs: updatedLogs };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });

  return {
    pets: petsQuery.data || [],
    medications: medicationsQuery.data || [],
    logs: logsQuery.data || [],
    isLoading: petsQuery.isLoading || medicationsQuery.isLoading || logsQuery.isLoading,
    addPet: addPetMutation.mutateAsync,
    updatePet: updatePetMutation.mutateAsync,
    deletePet: deletePetMutation.mutateAsync,
    addMedication: addMedicationMutation.mutateAsync,
    updateMedication: updateMedicationMutation.mutateAsync,
    deleteMedication: deleteMedicationMutation.mutateAsync,
    markMedicationGiven: markMedicationGivenMutation.mutateAsync,
    isAddingPet: addPetMutation.isPending,
    isMarkingGiven: markMedicationGivenMutation.isPending,
  };
});

export function useTodayMedications() {
  const { medications, pets } = usePetMeds();
  const today = new Date().toISOString().split('T')[0];
  
  return medications
    .filter(med => med.nextDue <= today)
    .map(med => {
      const pet = pets.find(p => p.id === med.petId);
      return { ...med, petName: pet?.name || 'Unknown Pet', petPhoto: pet?.photoUri };
    })
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
}

export function usePetMedications(petId: string) {
  const { medications } = usePetMeds();
  return medications.filter(med => med.petId === petId);
}
