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
  const [activeTab, setActiveTab] = useState<
    'general' | 'chassis' | 'drivetrain' | 'tires' | 'engine'
  >('general');

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

  // Tab içeriklerini gösteren yardımcı fonksiyon
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Açıklama Bilgisi */}
            <div className='border rounded-md overflow-hidden col-span-1 md:col-span-2'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Setup Açıklaması</h3>
              </div>
              <div className='p-4 bg-gray-50'>
                <p className='text-gray-800 whitespace-pre-wrap'>
                  {currentTuning.explanation}
                </p>
              </div>
            </div>

            {/* Genel Bilgiler */}
            <div className='border rounded-md overflow-hidden'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Araç Özellikleri</h3>
              </div>
              <div className='p-4'>
                <p className='font-medium text-gray-800'>
                  {currentCar?.brand} {currentCar?.model} ({currentCar?.year})
                </p>
                <div className='grid grid-cols-2 gap-3 mt-2'>
                  <div>
                    <p className='text-sm text-gray-600'>Motor Gücü</p>
                    <p className='font-medium'>
                      {currentCar?.performance.power} HP
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Tork</p>
                    <p className='font-medium'>
                      {currentCar?.performance.torque} N-m
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Çekiş</p>
                    <p className='font-medium'>
                      {currentCar?.performance.drivetrain}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Ağırlık Dağılımı</p>
                    <p className='font-medium'>
                      %{currentCar?.performance.frontWeight} Ön
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Braking */}
            <div className='border rounded-md overflow-hidden'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Fren Ayarları</h3>
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
                  {currentTuning.braking.brakeType && (
                    <div className='col-span-2'>
                      <p className='text-sm text-gray-600'>Fren Tipi</p>
                      <p className='font-medium'>
                        {currentTuning.braking.brakeType}
                      </p>
                    </div>
                  )}
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
          </div>
        );

      case 'chassis':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                  {currentTuning.springs.springType && (
                    <div className='col-span-2'>
                      <p className='text-sm text-gray-600'>Yay Tipi</p>
                      <p className='font-medium'>
                        {currentTuning.springs.springType}
                      </p>
                    </div>
                  )}
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
          </div>
        );

      case 'drivetrain':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Vites (Gearing) */}
            <div className='border rounded-md overflow-hidden col-span-1 md:col-span-2'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Vites Oranları</h3>
              </div>
              <div className='p-4'>
                <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3'>
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
                  {currentTuning.gearing.sixthGear && (
                    <div>
                      <p className='text-sm text-gray-600'>6. Vites</p>
                      <p className='font-medium'>
                        {currentTuning.gearing.sixthGear.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {currentTuning.gearing.seventhGear && (
                    <div>
                      <p className='text-sm text-gray-600'>7. Vites</p>
                      <p className='font-medium'>
                        {currentTuning.gearing.seventhGear.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {currentTuning.gearing.eighthGear && (
                    <div>
                      <p className='text-sm text-gray-600'>8. Vites</p>
                      <p className='font-medium'>
                        {currentTuning.gearing.eighthGear.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {currentTuning.gearing.topSpeed && (
                    <div>
                      <p className='text-sm text-gray-600'>Maks. Hız</p>
                      <p className='font-medium'>
                        {currentTuning.gearing.topSpeed} km/h
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Differential */}
            <div className='border rounded-md overflow-hidden col-span-1 md:col-span-2'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Diferansiyel</h3>
              </div>
              <div className='p-4'>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                  {currentTuning.differential.frontAccel !== undefined && (
                    <div>
                      <p className='text-sm text-gray-600'>Ön Hızlanma</p>
                      <p className='font-medium'>
                        %{currentTuning.differential.frontAccel}
                      </p>
                    </div>
                  )}
                  {currentTuning.differential.frontDecel !== undefined && (
                    <div>
                      <p className='text-sm text-gray-600'>Ön Yavaşlama</p>
                      <p className='font-medium'>
                        %{currentTuning.differential.frontDecel}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className='text-sm text-gray-600'>Arka Hızlanma</p>
                    <p className='font-medium'>
                      %{currentTuning.differential.rearAccel}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>Arka Yavaşlama</p>
                    <p className='font-medium'>
                      %{currentTuning.differential.rearDecel}
                    </p>
                  </div>
                  {currentTuning.differential.center !== undefined && (
                    <div>
                      <p className='text-sm text-gray-600'>Merkez Dağılımı</p>
                      <p className='font-medium'>
                        %{currentTuning.differential.center}
                      </p>
                    </div>
                  )}
                  {currentTuning.differential.diffType !== undefined && (
                    <div>
                      <p className='text-sm text-gray-600'>Diferansiyel Tipi</p>
                      <p className='font-medium'>
                        {currentTuning.differential.diffType}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'tires':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Lastikler (Tires) */}
            <div className='border rounded-md overflow-hidden col-span-1 md:col-span-2'>
              <div className='bg-purple-700 text-white p-3'>
                <h3 className='font-medium'>Lastik Ayarları</h3>
              </div>
              <div className='p-4'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
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
                  {currentTuning.tires.frontWidth && (
                    <div>
                      <p className='text-sm text-gray-600'>Ön Genişlik</p>
                      <p className='font-medium'>
                        {currentTuning.tires.frontWidth} mm
                      </p>
                    </div>
                  )}
                  {currentTuning.tires.rearWidth && (
                    <div>
                      <p className='text-sm text-gray-600'>Arka Genişlik</p>
                      <p className='font-medium'>
                        {currentTuning.tires.rearWidth} mm
                      </p>
                    </div>
                  )}
                  {currentTuning.tires.frontProfile && (
                    <div>
                      <p className='text-sm text-gray-600'>Ön Profil</p>
                      <p className='font-medium'>
                        {currentTuning.tires.frontProfile}
                      </p>
                    </div>
                  )}
                  {currentTuning.tires.rearProfile && (
                    <div>
                      <p className='text-sm text-gray-600'>Arka Profil</p>
                      <p className='font-medium'>
                        {currentTuning.tires.rearProfile}
                      </p>
                    </div>
                  )}
                  {currentTuning.tires.frontRimSize && (
                    <div>
                      <p className='text-sm text-gray-600'>Ön Jant Boyutu</p>
                      <p className='font-medium'>
                        {currentTuning.tires.frontRimSize}"
                      </p>
                    </div>
                  )}
                  {currentTuning.tires.rearRimSize && (
                    <div>
                      <p className='text-sm text-gray-600'>Arka Jant Boyutu</p>
                      <p className='font-medium'>
                        {currentTuning.tires.rearRimSize}"
                      </p>
                    </div>
                  )}
                  {currentTuning.tires.compound && (
                    <div>
                      <p className='text-sm text-gray-600'>Lastik Tipi</p>
                      <p className='font-medium'>
                        {currentTuning.tires.compound}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'engine':
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Motor Yükseltmeleri */}
            {currentTuning.engine && (
              <div className='border rounded-md overflow-hidden col-span-1 md:col-span-2'>
                <div className='bg-purple-700 text-white p-3'>
                  <h3 className='font-medium'>Motor Yükseltmeleri</h3>
                </div>
                <div className='p-4'>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                    {currentTuning.engine.intakeLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>Emme Seviyesi</p>
                        <p className='font-medium'>
                          {currentTuning.engine.intakeLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.exhaustLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>Egzoz Seviyesi</p>
                        <p className='font-medium'>
                          {currentTuning.engine.exhaustLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.camshaftLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>
                          Kam Mili Seviyesi
                        </p>
                        <p className='font-medium'>
                          {currentTuning.engine.camshaftLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.valvesLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>Supap Seviyesi</p>
                        <p className='font-medium'>
                          {currentTuning.engine.valvesLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.engineBlockLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>
                          Motor Bloğu Seviyesi
                        </p>
                        <p className='font-medium'>
                          {currentTuning.engine.engineBlockLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.pistonLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>Piston Seviyesi</p>
                        <p className='font-medium'>
                          {currentTuning.engine.pistonLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.turboLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>Turbo Seviyesi</p>
                        <p className='font-medium'>
                          {currentTuning.engine.turboLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.intercoolerLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>
                          Intercooler Seviyesi
                        </p>
                        <p className='font-medium'>
                          {currentTuning.engine.intercoolerLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.oilLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>
                          Yağ Soğutma Seviyesi
                        </p>
                        <p className='font-medium'>
                          {currentTuning.engine.oilLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.flyWheelLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>Volan Seviyesi</p>
                        <p className='font-medium'>
                          {currentTuning.engine.flyWheelLevel}
                        </p>
                      </div>
                    )}
                    {currentTuning.engine.ignitionLevel !== undefined && (
                      <div>
                        <p className='text-sm text-gray-600'>
                          Ateşleme Sistemi Seviyesi
                        </p>
                        <p className='font-medium'>
                          {currentTuning.engine.ignitionLevel}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!currentTuning.engine && (
              <div className='border rounded-md overflow-hidden col-span-1 md:col-span-2 p-4'>
                <p className='text-gray-600 italic'>
                  Motor yükseltme detayları bu setup için mevcut değil.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
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

      {/* Kategorileri seçme tabları */}
      <div className='mb-6 border-b border-gray-200'>
        <nav className='-mb-px flex space-x-2 overflow-x-auto'>
          <button
            onClick={() => setActiveTab('general')}
            className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('chassis')}
            className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'chassis'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Şasi
          </button>
          <button
            onClick={() => setActiveTab('drivetrain')}
            className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'drivetrain'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Aktarma Organları
          </button>
          <button
            onClick={() => setActiveTab('tires')}
            className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'tires'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lastikler
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'engine'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Motor
          </button>
        </nav>
      </div>

      {/* Tab içeriği */}
      {renderTabContent()}
    </div>
  );
}
