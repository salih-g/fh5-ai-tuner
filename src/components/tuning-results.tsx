'use client';

import React, { useEffect, useState } from 'react';
import { useTuningStore } from '@/lib/store/tuning-store';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TuningFeedback, tuningFeedbackSchema } from '@/lib/validations/car';
import { adjustTuning } from '@/lib/services/ai-service';

export default function TuningResults() {
  const {
    currentTuning,
    currentCar,
    setCurrentTuning,
    generationStatus,
    setGenerationStatus,
  } = useTuningStore();
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [savedSetupId, setSavedSetupId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TuningFeedback>({
    resolver: zodResolver(tuningFeedbackSchema),
    defaultValues: {
      setupId: '',
      feedback: '',
    },
  });

  if (!isClient) {
    return null;
  }

  if (generationStatus === 'loading') {
    return (
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex justify-center items-center py-10'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          <p className='ml-3 text-lg'>Tuning oluşturuluyor...</p>
        </div>
      </div>
    );
  }

  if (!currentTuning || generationStatus !== 'success') {
    return null;
  }

  const saveSetup = async () => {
    if (!currentCar || !currentTuning) return;

    try {
      const response = await axios.post('/api/tuning-setups', {
        carId: currentCar.id,
        name: 'Yeni Setup', // Bu form aracılığıyla alınabilir
        prompt: 'Kullanıcı isteği', // Bu form aracılığıyla alınabilir
        tuningData: {
          ...currentTuning,
          explanation: currentTuning.explanation,
        },
      });

      setSavedSetupId(response.data.id);
      toast.success('Setup başarıyla kaydedildi!');
    } catch (error: any) {
      console.error('Setup save error:', error);
      toast.error(
        error.response?.data?.error || 'Setup kaydedilirken bir hata oluştu'
      );
    }
  };

  const handleFeedbackSubmit = async (data: TuningFeedback) => {
    if (!currentCar || !currentTuning) return;

    try {
      setGenerationStatus('loading');

      const adjustedTuning = await adjustTuning({
        car: {
          brand: currentCar.brand,
          model: currentCar.model,
          year: currentCar.year,
          performance: currentCar.performance,
        },
        currentSetup: currentTuning,
        feedback: data.feedback,
      });

      setCurrentTuning(adjustedTuning);
      setGenerationStatus('success');
      setShowFeedbackForm(false);
      reset();
      toast.success('Tuning başarıyla güncellendi!');
    } catch (error: any) {
      console.error('Tuning adjustment error:', error);
      setGenerationStatus('error');
      toast.error(error.message || 'Tuning güncellenirken bir hata oluştu');
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Tuning Sonuçları</h2>
        <div className='space-x-2'>
          <button
            onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            className='bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md'
          >
            {showFeedbackForm ? 'Geri Bildirimi İptal Et' : 'Düzeltme İste'}
          </button>

          <button
            onClick={saveSetup}
            disabled={!!savedSetupId}
            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50'
          >
            {savedSetupId ? 'Kaydedildi' : "Setup'ı Kaydet"}
          </button>
        </div>
      </div>

      {showFeedbackForm ? (
        <form
          onSubmit={handleSubmit(handleFeedbackSubmit)}
          className='mb-8 border p-4 rounded-md'
        >
          <h3 className='text-lg font-medium mb-2'>Tuning Düzeltme İsteği</h3>
          <div>
            <textarea
              {...register('feedback')}
              rows={4}
              placeholder="Tuning'de neyin değişmesini istediğinizi açıklayın. Örn: Arka lastikler virajlarda çok kayıyor, daha fazla yol tutuşu istiyorum."
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
            />
            {errors.feedback && (
              <p className='text-red-600 text-sm mt-1'>
                {errors.feedback.message}
              </p>
            )}
          </div>
          <div className='mt-3'>
            <button
              type='submit'
              className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
            >
              Tuning'i Güncelle
            </button>
          </div>
        </form>
      ) : null}

      <div className='mb-6'>
        <h3 className='text-lg font-medium mb-2'>Açıklama</h3>
        <div className='bg-gray-50 p-4 rounded-md'>
          <p>{currentTuning.explanation}</p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Lastikler (Tires) */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Lastikler</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Ön Basınç</p>
                <p className='font-medium'>
                  {currentTuning.tires.frontPressure.toFixed(1)} bar
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Basınç</p>
                <p className='font-medium'>
                  {currentTuning.tires.rearPressure.toFixed(1)} bar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vites (Gearing) */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Vites</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-3 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Final Drive</p>
                <p className='font-medium'>
                  {currentTuning.gearing.finalDrive.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>1. Vites</p>
                <p className='font-medium'>
                  {currentTuning.gearing.firstGear.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>2. Vites</p>
                <p className='font-medium'>
                  {currentTuning.gearing.secondGear.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>3. Vites</p>
                <p className='font-medium'>
                  {currentTuning.gearing.thirdGear.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>4. Vites</p>
                <p className='font-medium'>
                  {currentTuning.gearing.fourthGear.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>5. Vites</p>
                <p className='font-medium'>
                  {currentTuning.gearing.fifthGear.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>6. Vites</p>
                <p className='font-medium'>
                  {currentTuning.gearing.sixthGear.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alignment */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Alignment</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Ön Kamber</p>
                <p className='font-medium'>
                  {currentTuning.alignment.frontCamber.toFixed(1)}°
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Kamber</p>
                <p className='font-medium'>
                  {currentTuning.alignment.rearCamber.toFixed(1)}°
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Ön Toe</p>
                <p className='font-medium'>
                  {currentTuning.alignment.frontToe.toFixed(1)}°
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Toe</p>
                <p className='font-medium'>
                  {currentTuning.alignment.rearToe.toFixed(1)}°
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Ön Caster</p>
                <p className='font-medium'>
                  {currentTuning.alignment.frontCaster.toFixed(1)}°
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-roll Bars */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Anti-roll Bars</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Ön</p>
                <p className='font-medium'>
                  {currentTuning.antirollBars.front.toFixed(2)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka</p>
                <p className='font-medium'>
                  {currentTuning.antirollBars.rear.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Springs */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Yaylar</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Ön Sertlik</p>
                <p className='font-medium'>
                  {currentTuning.springs.frontStiffness.toFixed(1)} kgf/mm
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Sertlik</p>
                <p className='font-medium'>
                  {currentTuning.springs.rearStiffness.toFixed(1)} kgf/mm
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Ön Yükseklik</p>
                <p className='font-medium'>
                  {currentTuning.springs.frontHeight.toFixed(1)} cm
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Yükseklik</p>
                <p className='font-medium'>
                  {currentTuning.springs.rearHeight.toFixed(1)} cm
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Damping */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Amortisörler</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Ön Rebound</p>
                <p className='font-medium'>
                  {currentTuning.damping.frontReboundStiffness.toFixed(1)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Rebound</p>
                <p className='font-medium'>
                  {currentTuning.damping.rearReboundStiffness.toFixed(1)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Ön Bump</p>
                <p className='font-medium'>
                  {currentTuning.damping.frontBumpStiffness.toFixed(1)}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Bump</p>
                <p className='font-medium'>
                  {currentTuning.damping.rearBumpStiffness.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aero */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Aerodinamik</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Ön Downforce</p>
                <p className='font-medium'>
                  {currentTuning.aero.frontDownforce} kgf
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Arka Downforce</p>
                <p className='font-medium'>
                  {currentTuning.aero.rearDownforce} kgf
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Braking */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Frenler</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Fren Dengesi</p>
                <p className='font-medium'>
                  %{currentTuning.braking.brakeBalance} ön
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Fren Basıncı</p>
                <p className='font-medium'>
                  %{currentTuning.braking.brakePressure}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Differential */}
        <div className='border rounded-md overflow-hidden'>
          <div className='bg-purple-700 text-white p-3'>
            <h3 className='font-medium'>Diferansiyel</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <p className='text-sm text-gray-600'>Hızlanma</p>
                <p className='font-medium'>
                  %{currentTuning.differential.acceleration}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600'>Yavaşlama</p>
                <p className='font-medium'>
                  %{currentTuning.differential.deceleration}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
