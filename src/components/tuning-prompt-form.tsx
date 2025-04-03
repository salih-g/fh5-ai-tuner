import React, { useEffect } from 'react';
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
    setValue,
  } = useForm<TuningPrompt>({
    resolver: zodResolver(tuningPromptSchema),
    defaultValues: {
      carId: '',
      prompt: '',
      name: '',
      setupType: 'Genel',
    },
  });

  // Önemli: carId değerini currentCar değiştiğinde otomatik güncelle
  useEffect(() => {
    if (currentCar) {
      setValue('carId', currentCar.id);
    }
  }, [currentCar, setValue]);

  const onSubmit = async (data: TuningPrompt) => {
    if (!currentCar) {
      toast.error('Lütfen önce bir araç seçin');
      return;
    }

    try {
      console.log('Form verileri:', data); // Debug için form verilerini kontrol et
      setGenerationStatus('loading');

      const tuningResponse = await generateTuning({
        car: {
          brand: currentCar.brand,
          model: currentCar.model,
          year: currentCar.year,
          performance: currentCar.performance,
        },
        prompt: data.prompt,
        setupType: data.setupType,
      });

      console.log('AI yanıtı:', tuningResponse); // Debug için AI yanıtını kontrol et
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
        {/* Hidden input'u sadece register ile kullan, doğrudan value atama */}
        <input type='hidden' {...register('carId')} />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
              Setup Tipi
            </label>
            <select
              {...register('setupType')}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
            >
              <option value='Pist'>Pist (Circuit)</option>
              <option value='Ralli'>Ralli (Rally)</option>
              <option value='Drift'>Drift</option>
              <option value='Drag'>Drag</option>
              <option value='Offroad'>Offroad</option>
              <option value='Cruise'>Cruise / Seyir</option>
              <option value='Genel'>Genel (Çok Amaçlı)</option>
            </select>
            {errors.setupType && (
              <p className='text-red-600 text-sm mt-1'>
                {errors.setupType.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Tuning İsteğiniz (Ne tür bir performans istediğinizi detaylandırın)
          </label>
          <textarea
            {...register('prompt')}
            rows={5}
            placeholder='Aracın nasıl davranmasını istediğinizi açıklayın. Örn: Nürburgring pistinde hızlı turlar atmak için virajlarda dengeli ve stabil bir setup istiyorum. Viraj çıkışlarında iyi çekiş sağlamalı. Aracın understeer (önden kayma) eğilimini azaltmak istiyorum.'
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
          />
          {errors.prompt && (
            <p className='text-red-600 text-sm mt-1'>{errors.prompt.message}</p>
          )}
        </div>

        <div className='p-4 bg-blue-50 rounded-md border border-blue-200'>
          <h3 className='text-blue-800 font-medium mb-2'>Öneriler:</h3>
          <p className='text-blue-700 text-sm'>
            Daha iyi sonuçlar için, tuning isteğinizde şu bilgileri paylaşmanız
            faydalı olabilir:
          </p>
          <ul className='text-blue-600 text-sm list-disc pl-5 mt-2 space-y-1'>
            <li>
              Aracın hangi koşullarda kullanılacağı (yağmurlu, kuru, offroad,
              vb.)
            </li>
            <li>
              Aradığınız kullanım hissi (kararlı, tepkili, agresif, dengeli)
            </li>
            <li>
              Olumlu bulduğunuz mevcut özellikler ve değiştirmek istediğiniz
              davranışlar
            </li>
            <li>
              Virajlarda yaşadığınız sorunlar (önden kayma, arkadan kayma, vb.)
            </li>
            <li>
              Performansın en önemli olduğu alanlar (hızlanma, fren, stabilite,
              maksimum hız)
            </li>
          </ul>
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
