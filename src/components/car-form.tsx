'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Car,
  carSchema,
  drivetrainEnum,
  enginePositionEnum,
  aspirationEnum,
} from '@/lib/validations/car';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTuningStore } from '@/lib/store/tuning-store';

export default function CarForm() {
  const { setCurrentCar, setError } = useTuningStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Car>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: 2022,
      performance: {
        power: 0,
        torque: 0,
        weight: 0,
        frontWeight: 50,
        rearWeight: 50,
        displacement: 0,
        drivetrain: 'RWD',
        category: '',
        pi: 0,
        enginePosition: 'Front',
        aspiration: 'NA',
        cylinders: 4,
      },
    },
  });

  // Ön ağırlık değiştiğinde arka ağırlığı otomatik güncelle
  const frontWeight = watch('performance.frontWeight');
  React.useEffect(() => {
    setValue('performance.rearWeight', 100 - Number(frontWeight));
  }, [frontWeight, setValue]);

  const onSubmit = async (data: Car) => {
    try {
      setError(null);
      const response = await axios.post('/api/cars', data);
      setCurrentCar(response.data);
      toast.success('Araç başarıyla kaydedildi!');
      reset();
    } catch (error: any) {
      console.error('Car save error:', error);
      setError(
        error.response?.data?.error || 'Araç kaydedilirken bir hata oluştu'
      );
      toast.error(
        error.response?.data?.error || 'Araç kaydedilirken bir hata oluştu'
      );
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Araç Bilgileri</h2>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* Tab buttons */}
        <div className='flex border-b border-gray-200 mb-4'>
          <button
            type='button'
            className={`py-2 px-4 font-medium ${
              activeTab === 'basic'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            Temel Bilgiler
          </button>
          <button
            type='button'
            className={`py-2 px-4 font-medium ${
              activeTab === 'advanced'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('advanced')}
          >
            Detaylı Bilgiler
          </button>
        </div>

        {/* Temel Bilgiler Tab */}
        {activeTab === 'basic' && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Ana araç bilgileri */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Marka
                </label>
                <input
                  type='text'
                  {...register('brand')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.brand && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.brand.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Model
                </label>
                <input
                  type='text'
                  {...register('model')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.model && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.model.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Yıl
                </label>
                <input
                  type='number'
                  {...register('year')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.year && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            <h3 className='text-xl font-medium mt-6 mb-2'>
              Temel Performans Özellikleri
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Temel performans bilgileri */}
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Beygir Gücü (HP)
                </label>
                <input
                  type='number'
                  {...register('performance.power')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.power && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.power.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Tork (N-m)
                </label>
                <input
                  type='number'
                  {...register('performance.torque')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.torque && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.torque.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Ağırlık (kg)
                </label>
                <input
                  type='number'
                  {...register('performance.weight')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.weight && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.weight.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Ön Ağırlık Dağılımı (%)
                </label>
                <input
                  type='number'
                  {...register('performance.frontWeight')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.frontWeight && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.frontWeight.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Arka Ağırlık Dağılımı (%)
                </label>
                <input
                  type='number'
                  {...register('performance.rearWeight')}
                  disabled
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100'
                />
                {errors.performance?.rearWeight && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.rearWeight.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Motor Hacmi (cc)
                </label>
                <input
                  type='number'
                  {...register('performance.displacement')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.displacement && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.displacement.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Çekiş Sistemi
                </label>
                <select
                  {...register('performance.drivetrain')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                >
                  {Object.values(drivetrainEnum.enum).map((drivetrain) => (
                    <option key={drivetrain} value={drivetrain}>
                      {drivetrain === 'RWD'
                        ? 'Arkadan İtiş (RWD)'
                        : drivetrain === 'FWD'
                        ? 'Önden Çekiş (FWD)'
                        : 'Dört Tekerlekten Çekiş (AWD)'}
                    </option>
                  ))}
                </select>
                {errors.performance?.drivetrain && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.drivetrain.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Kategori (S2, A, vb.)
                </label>
                <input
                  type='text'
                  {...register('performance.category')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.category && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Performans İndeksi (PI)
                </label>
                <input
                  type='number'
                  {...register('performance.pi')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.pi && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.pi.message}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Gelişmiş Bilgiler Tab */}
        {activeTab === 'advanced' && (
          <>
            <h3 className='text-xl font-medium mb-4'>
              Detaylı Motor ve Performans Bilgileri
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Motor Konumu
                </label>
                <select
                  {...register('performance.enginePosition')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                >
                  {Object.values(enginePositionEnum.enum).map((position) => (
                    <option key={position} value={position}>
                      {position === 'Front'
                        ? 'Ön (Front)'
                        : position === 'Mid'
                        ? 'Orta (Mid)'
                        : 'Arka (Rear)'}
                    </option>
                  ))}
                </select>
                {errors.performance?.enginePosition && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.enginePosition.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Besleme Tipi
                </label>
                <select
                  {...register('performance.aspiration')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                >
                  {Object.values(aspirationEnum.enum).map((aspiration) => (
                    <option key={aspiration} value={aspiration}>
                      {aspiration === 'NA'
                        ? 'Atmosferik (NA)'
                        : aspiration === 'Turbo'
                        ? 'Turbo'
                        : aspiration === 'Twin-turbo'
                        ? 'İkiz Turbo (Twin-turbo)'
                        : 'Süperşarj (Supercharged)'}
                    </option>
                  ))}
                </select>
                {errors.performance?.aspiration && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.aspiration.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Silindir Sayısı
                </label>
                <input
                  type='number'
                  {...register('performance.cylinders')}
                  min='1'
                  max='16'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.cylinders && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.cylinders.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Fabrika Çıkışı Maks. Hız (km/h)
                </label>
                <input
                  type='number'
                  {...register('performance.stockTopSpeed')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.stockTopSpeed && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.stockTopSpeed.message}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  0-100 km/h Hızlanma (sn)
                </label>
                <input
                  type='number'
                  step='0.1'
                  {...register('performance.stockAccel')}
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm'
                />
                {errors.performance?.stockAccel && (
                  <p className='text-red-600 text-sm mt-1'>
                    {errors.performance.stockAccel.message}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <div className='mt-6'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50'
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Aracı Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
