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

  if (loading) {
    return <div className='py-4 text-center'>Araçlar yükleniyor...</div>;
  }

  if (cars.length === 0) {
    return (
      <div className='bg-yellow-50 p-4 rounded-md'>
        <p className='text-yellow-700'>
          Henüz hiç araç kaydedilmemiş. Lütfen önce bir araç ekleyin.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Kayıtlı Araçlar</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {cars.map((car) => (
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
                <p>Güç: {car.performance.power} HP</p>
                <p>Tork: {car.performance.torque} N-m</p>
                <p>Ağırlık: {car.performance.weight} kg</p>
              </div>
              <div>
                <p>Kategori: {car.performance.category}</p>
                <p>PI: {car.performance.pi}</p>
                <p>Çekiş: {car.performance.drivetrain}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
