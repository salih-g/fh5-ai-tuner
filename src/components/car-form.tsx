'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, carSchema } from '@/lib/validations/car';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTuningStore } from '@/lib/store/tuning-store';

export default function CarForm() {
  const { setCurrentCar, setError } = useTuningStore();

  const {
    register,
    handleSubmit,
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
        displacement: 0,
        drivetrain: 'RWD',
        category: '',
        pi: 0,
      },
    },
  });

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
              <p className='text-red-600 text-sm mt-1'>{errors.year.message}</p>
            )}
          </div>
        </div>

        <h3 className='text-xl font-medium mt-6 mb-2'>
          Performans Özellikleri
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Performans bilgileri */}
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
              <option value='RWD'>Arkadan İtiş (RWD)</option>
              <option value='FWD'>Önden Çekiş (FWD)</option>
              <option value='AWD'>Dört Tekerlekten Çekiş (AWD)</option>
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
              Performans İndeksi
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
