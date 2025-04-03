'use client';

import React, { useState } from 'react';
import CarForm from '@/components/car-form';
import CarSelector from '@/components/car-selector';
import TuningPromptForm from '@/components/tuning-prompt-form';
import TuningResults from '@/components/tuning-results';
import SavedSetups from '@/components/saved-setups';
import { ToastContainer } from 'react-toastify';
import { useTuningStore } from '@/lib/store/tuning-store';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const { currentCar, generationStatus } = useTuningStore();

  return (
    <main className='min-h-screen bg-gray-100'>
      <ToastContainer position='top-right' />

      <header className='bg-gradient-to-r from-purple-900 to-blue-800 text-white p-6 shadow-md'>
        <div className='container mx-auto'>
          <h1 className='text-4xl font-bold'>
            Forza Horizon 5 Tuning Asistanı
          </h1>
          <p className='mt-2 text-xl text-blue-100'>
            Aracınızın potansiyelini maksimize eden, AI destekli otomatik setup
            oluşturucu
          </p>
          <p className='mt-1 text-sm text-blue-200'>
            Forza Horizon 5 oyunundaki tüm araç parametrelerini dikkate alarak
            özelleştirilmiş tuning setleri oluşturur
          </p>
        </div>
      </header>

      <div className='container mx-auto py-8 px-4'>
        <div className='mb-8'>
          <div className='flex border-b border-gray-300'>
            <button
              className={`py-3 px-6 font-medium text-lg ${
                activeTab === 'create'
                  ? 'border-b-2 border-purple-600 text-purple-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('create')}
            >
              Tuning Oluştur
            </button>
            <button
              className={`py-3 px-6 font-medium text-lg ${
                activeTab === 'saved'
                  ? 'border-b-2 border-purple-600 text-purple-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              Kaydedilmiş Setup'lar
            </button>
          </div>
        </div>

        {activeTab === 'create' ? (
          <div className='space-y-8'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <CarForm />
              <CarSelector />
            </div>

            {currentCar && (
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 mt-1'>
                    <svg
                      className='h-5 w-5 text-blue-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm leading-5 font-medium text-blue-800'>
                      Seçili Araç: {currentCar.brand} {currentCar.model} (
                      {currentCar.year})
                    </h3>
                    <div className='mt-1 text-sm leading-5 text-blue-700'>
                      <p>
                        Bu araç için tuning oluşturmak için aşağıdaki formu
                        kullanabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <TuningPromptForm />

            {generationStatus === 'success' && <TuningResults />}
          </div>
        ) : (
          <SavedSetups />
        )}

        <div className='mt-12 bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-2xl font-bold mb-4'>Tuning Rehberi</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='border rounded-md overflow-hidden'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Lastik Ayarları</h3>
              </div>
              <div className='p-4'>
                <p className='text-gray-700'>
                  Lastik basıncı, yol tutuşu ve tepki süresi arasındaki dengeyi
                  etkiler. Düşük basınç daha fazla temas alanı sağlar ancak
                  tepki süresini artırır. Yüksek basınç daha hızlı tepki verir
                  ancak tutuş azalabilir. Ön ve arka arasındaki denge, aracın
                  viraj karakteristiğini belirler.
                </p>
              </div>
            </div>

            <div className='border rounded-md overflow-hidden'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Alignment</h3>
              </div>
              <div className='p-4'>
                <p className='text-gray-700'>
                  Kamber (Camber) tekerleklerin dikey açısını ayarlar. Negatif
                  kamber virajlarda daha iyi tutunma sağlar. Toe ayarı
                  tekerleklerin yatay açısını belirler. Toe-in (içe dönük)
                  stabilite, toe-out (dışa dönük) daha keskin dönüşler sağlar.
                  Caster, direksiyon dönüşlerinde stabiliteyi etkiler.
                </p>
              </div>
            </div>

            <div className='border rounded-md overflow-hidden'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Diferansiyel</h3>
              </div>
              <div className='p-4'>
                <p className='text-gray-700'>
                  Diferansiyel ayarları, hızlanmada ve yavaşlamada tekerlekler
                  arasında gücün nasıl dağıtılacağını belirler. Yüksek değerler
                  tekerlekleri birlikte kilitler, düşük değerler bağımsız
                  dönmelerine izin verir. RWD için arka diferansiyel, AWD için
                  hem ön, arka hem de merkez diferansiyel ayarlanır.
                </p>
              </div>
            </div>

            <div className='border rounded-md overflow-hidden'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Antiroll Bars ve Yaylar</h3>
              </div>
              <div className='p-4'>
                <p className='text-gray-700'>
                  Antiroll bars (viraj demirleri) aracın yalpa hareketini
                  kontrol eder. Sert ön antiroll bar understeer (önden kayma),
                  sert arka antiroll bar oversteer (arkadan kayma) eğilimini
                  artırır. Yay sertliği aracın yol tutuşunu, sürüş yüksekliği
                  ise ağırlık merkezini ve aerodinamiği etkiler.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className='mt-10 pt-6 border-t border-gray-200 text-center text-gray-600 text-sm'>
          <p>
            Bu uygulama, Forza Horizon 5 oyunundaki araç performansını optimize
            etmek için AI destekli tuning önerileri oluşturmak amacıyla
            tasarlanmıştır.
          </p>
          <p className='mt-2'>© 2024 FH5 Tuning Asistanı</p>
        </footer>
      </div>
    </main>
  );
}
