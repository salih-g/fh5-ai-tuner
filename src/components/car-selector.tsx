'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Car, CarPerformance } from '@prisma/client';
import { useTuningStore } from '@/lib/store/tuning-store';
import { toast } from 'react-toastify';

export default function CarSelector() {
  const [cars, setCars] = useState<(Car & { performance: CarPerformance })[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { setCurrentCar, currentCar, setError } = useTuningStore();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/cars');
        setCars(response.data);
      } catch (error: any) {
        console.error('Car fetch error:', error);
        setError(
          error.response?.data?.error || 'Araçlar yüklenirken bir hata oluştu'
        );
        toast.error(
          error.response?.data?.error || 'Araçlar yüklenirken bir hata oluştu'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [setError]);

  const handleCarSelect = (car: Car & { performance: CarPerformance }) => {
    setCurrentCar(car);
    toast.info(`${car.brand} ${car.model} seçildi`);
  };

  // Filtreleme işlevi
  const filteredCars = cars.filter(
    (car) =>
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.performance.category
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      car.performance.drivetrain
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='py-4 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto'></div>
          <p className='mt-2'>Araçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='bg-yellow-50 p-4 rounded-md'>
          <p className='text-yellow-700'>
            Henüz hiç araç kaydedilmemiş. Lütfen önce bir araç ekleyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Kayıtlı Araçlar</h2>

      <div className='mb-4'>
        <div className='relative'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Araç ara (marka, model, kategori, çekiş)'
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
          />
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <svg
              className='h-5 w-5 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {filteredCars.map((car) => (
          <div
            key={car.id}
            className={`p-4 border rounded-md cursor-pointer transition-colors ${
              currentCar?.id === car.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => handleCarSelect(car)}
          >
            <h3 className='font-semibold text-lg'>
              {car.brand} {car.model} ({car.year})
            </h3>
            <div className='grid grid-cols-2 gap-x-4 text-sm mt-2'>
              <div>
                <p>
                  <span className='font-medium'>Güç:</span>{' '}
                  {car.performance.power} HP
                </p>
                <p>
                  <span className='font-medium'>Tork:</span>{' '}
                  {car.performance.torque} N-m
                </p>
                <p>
                  <span className='font-medium'>Ağırlık:</span>{' '}
                  {car.performance.weight} kg
                </p>
                <p>
                  <span className='font-medium'>Ön Ağır.:</span> %
                  {car.performance.frontWeight}
                </p>
              </div>
              <div>
                <p>
                  <span className='font-medium'>Kategori:</span>{' '}
                  {car.performance.category}
                </p>
                <p>
                  <span className='font-medium'>PI:</span> {car.performance.pi}
                </p>
                <p>
                  <span className='font-medium'>Çekiş:</span>{' '}
                  {car.performance.drivetrain}
                </p>
                <p>
                  <span className='font-medium'>Hacim:</span>{' '}
                  {car.performance.displacement} cc
                </p>
              </div>
              {car.performance.enginePosition && (
                <p className='col-span-2 mt-1'>
                  <span className='font-medium'>Motor Konumu:</span>{' '}
                  {car.performance.enginePosition}
                </p>
              )}
              {car.performance.aspiration && (
                <p className='col-span-2'>
                  <span className='font-medium'>Besleme:</span>{' '}
                  {car.performance.aspiration}
                </p>
              )}
            </div>
            <div className='mt-2 pt-2 border-t border-gray-200 flex justify-between'>
              <span className='text-xs text-gray-500'>
                Eklenme: {new Date(car.createdAt).toLocaleDateString()}
              </span>
              {currentCar?.id === car.id && (
                <span className='text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md'>
                  Seçili
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
