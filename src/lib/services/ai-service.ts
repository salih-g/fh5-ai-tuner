import axios from 'axios';
import { CarPerformance } from '@prisma/client';

interface TuningRequest {
  car: {
    brand: string;
    model: string;
    year: number;
    performance: CarPerformance;
  };
  prompt: string;
}

interface TuningFeedbackRequest {
  car: {
    brand: string;
    model: string;
    year: number;
    performance: CarPerformance;
  };
  currentSetup: any; // Mevcut tuning ayarlarını içerir
  feedback: string;
}

// TuningResponse'u dışa aktarmak için "export" anahtar kelimesini ekliyoruz
export interface TuningResponse {
  tires: {
    frontPressure: number;
    rearPressure: number;
  };
  gearing: {
    finalDrive: number;
    firstGear: number;
    secondGear: number;
    thirdGear: number;
    fourthGear: number;
    fifthGear: number;
    sixthGear: number;
    seventhGear?: number;
    eighthGear?: number;
    ninthGear?: number;
    tenthGear?: number;
  };
  alignment: {
    frontCamber: number;
    rearCamber: number;
    frontToe: number;
    rearToe: number;
    frontCaster: number;
  };
  antirollBars: {
    front: number;
    rear: number;
  };
  springs: {
    frontStiffness: number;
    rearStiffness: number;
    frontHeight: number;
    rearHeight: number;
  };
  damping: {
    frontReboundStiffness: number;
    rearReboundStiffness: number;
    frontBumpStiffness: number;
    rearBumpStiffness: number;
  };
  aero: {
    frontDownforce: number;
    rearDownforce: number;
  };
  braking: {
    brakeBalance: number;
    brakePressure: number;
  };
  differential: {
    acceleration: number;
    deceleration: number;
  };
  explanation: string;
}

export async function generateTuning(
  request: TuningRequest
): Promise<TuningResponse> {
  try {
    const response = await axios.post<TuningResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/tuning`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('AI tuning generation failed:', error);
    throw new Error('Tuning oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
  }
}

export async function adjustTuning(
  request: TuningFeedbackRequest
): Promise<TuningResponse> {
  try {
    const response = await axios.post<TuningResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai/tuning/adjust`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('AI tuning adjustment failed:', error);
    throw new Error('Tuning ayarlanamadı. Lütfen daha sonra tekrar deneyin.');
  }
}
