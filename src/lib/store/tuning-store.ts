import { create } from 'zustand';
import { Car, CarPerformance } from '@prisma/client';
import { TuningResponse } from '@/lib/services/ai-service';

interface TuningState {
  currentCar: (Car & { performance: CarPerformance }) | null;
  currentTuning: TuningResponse | null;
  generationStatus: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;

  setCurrentCar: (car: (Car & { performance: CarPerformance }) | null) => void;
  setCurrentTuning: (tuning: TuningResponse | null) => void;
  setGenerationStatus: (
    status: 'idle' | 'loading' | 'success' | 'error'
  ) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTuningStore = create<TuningState>((set) => ({
  currentCar: null,
  currentTuning: null,
  generationStatus: 'idle',
  error: null,

  setCurrentCar: (car) => set({ currentCar: car }),
  setCurrentTuning: (tuning) => set({ currentTuning: tuning }),
  setGenerationStatus: (status) => set({ generationStatus: status }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentCar: null,
      currentTuning: null,
      generationStatus: 'idle',
      error: null,
    }),
}));
