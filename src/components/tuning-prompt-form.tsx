import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TuningPrompt, tuningPromptSchema } from '@/lib/validations/car';
import { useTuningStore } from '@/lib/store/tuning-store';
import { generateTuning } from '@/lib/services/ai-service';
import { toast } from 'react-toastify';

export default function TuningPromptForm() {
  const {
    currentCar,
    setCurrentTuning,
    setGenerationStatus,
    generationStatus,
  } = useTuningStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TuningPrompt>({
    resolver: zodResolver(tuningPromptSchema),
    defaultValues: {
      carId: '',
      prompt: '',
      name: '',
    },
  });

  const onSubmit = async (data: TuningPrompt) => {
    if (!currentCar) {
      toast.error('Lütfen önce bir araç seçin');
      return;
    }

    try {
      setGenerationStatus('loading');

      const tuningResponse = await generateTuning({
        car: {
          brand: currentCar.brand,
          model: currentCar.model,
          year: currentCar.year,
          performance: currentCar.performance,
        },
        prompt: data.prompt,
      });

      setCurrentTuning(tuningResponse);
      setGenerationStatus('success');
      toast.success('Tuning başarıyla oluşturuldu!');
      reset();
    } catch (error: any) {
      console.error('Tuning generation error:', error);
      setGenerationStatus('error');
      toast.error(error.message || 'Tuning oluşturulurken bir hata oluştu');
    }
  };

  if (!currentCar) {
    return (
      <div className='bg-yellow-50 p-4 rounded-md'>
        <p className='text-yellow-700'>
          Tuning oluşturmak için önce bir araç seçmelisiniz.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Tuning İsteği</h2>
      <p className='mb-4 text-gray-600'>
        <span className='font-medium'>Seçili Araç:</span> {currentCar.brand}{' '}
        {currentCar.model} ({currentCar.year})
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <input type='hidden' {...register('carId')} value={currentCar.id} />

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Setup İsmi
          </label>
          <input
            type='text'
            {...register('name')}
            placeholder='Örn: Nürburgring Hızlı Tur Setup'
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
          />
          {errors.name && (
            <p className='text-red-600 text-sm mt-1'>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Tuning İsteğiniz
          </label>
          <textarea
            {...register('prompt')}
            rows={5}
            placeholder='Aracın nasıl davranmasını istediğinizi açıklayın. Örn: Nürburgring pistinde hızlı turlar atmak için virajlarda dengeli ve stabil bir setup istiyorum. Viraj çıkışlarında iyi çekiş sağlamalı.'
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
          />
          {errors.prompt && (
            <p className='text-red-600 text-sm mt-1'>{errors.prompt.message}</p>
          )}
        </div>

        <div className='mt-6'>
          <button
            type='submit'
            disabled={generationStatus === 'loading'}
            className='w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50'
          >
            {generationStatus === 'loading'
              ? 'Tuning Oluşturuluyor...'
              : 'Tuning Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}
