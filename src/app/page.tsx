'use client';

import React, { useState } from 'react';
import CarForm from '@/components/car-form';
import CarSelector from '@/components/car-selector';
import TuningPromptForm from '@/components/tuning-prompt-form';
import TuningResults from '@/components/tuning-results';
import SavedSetups from '@/components/saved-setups';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  return (
    <main className='min-h-screen bg-gray-100'>
      <ToastContainer position='top-right' />

      <header className='bg-purple-900 text-white p-4 shadow-md'>
        <div className='container mx-auto'>
          <h1 className='text-3xl font-bold'>
            Forza Horizon 5 Tuning Asistanı
          </h1>
          <p className='mt-1 text-purple-200'>
            Aracınız için AI destekli, özelleştirilmiş tuning önerileri alın
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

            <TuningPromptForm />

            <TuningResults />
          </div>
        ) : (
          <SavedSetups />
        )}
      </div>
    </main>
  );
}
