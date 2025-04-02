import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTuningStore } from '@/lib/store/tuning-store';

interface TuningSetup {
  id: string;
  name: string;
  carId: string;
  car: {
    brand: string;
    model: string;
    year: number;
    performance: {
      power: number;
      torque: number;
      weight: number;
      frontWeight: number;
      displacement: number;
      drivetrain: string;
      category: string;
      pi: number;
    };
  };
  prompt: string;
  description: string;
  createdAt: string;

  tires: {
    frontPressure: number;
    rearPressure: number;
  };
  gearing: {
    finalDrive: number;
    firstGear: number;
    secondGear: number;
    thirdGear: number;
    fourthGear: number;
    fifthGear: number;
    sixthGear: number;
  };
  alignment: {
    frontCamber: number;
    rearCamber: number;
    frontToe: number;
    rearToe: number;
    frontCaster: number;
  };
  antirollBars: {
    front: number;
    rear: number;
  };
  springs: {
    frontStiffness: number;
    rearStiffness: number;
    frontHeight: number;
    rearHeight: number;
  };
  damping: {
    frontReboundStiffness: number;
    rearReboundStiffness: number;
    frontBumpStiffness: number;
    rearBumpStiffness: number;
  };
  aero: {
    frontDownforce: number;
    rearDownforce: number;
  };
  braking: {
    brakeBalance: number;
    brakePressure: number;
  };
  differential: {
    acceleration: number;
    deceleration: number;
  };
}

export default function SavedSetups() {
  const [setups, setSetups] = useState<TuningSetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSetup, setSelectedSetup] = useState<TuningSetup | null>(null);
  const { currentCar, setError } = useTuningStore();

  useEffect(() => {
    const fetchSetups = async () => {
      try {
        setLoading(true);
        const url = currentCar
          ? `/api/tuning-setups?carId=${currentCar.id}`
          : '/api/tuning-setups';

        const response = await axios.get(url);
        setSetups(response.data);
      } catch (error: any) {
        console.error('Setup fetch error:', error);
        setError(
          error.response?.data?.error || "Setup'lar yüklenirken bir hata oluştu"
        );
        toast.error(
          error.response?.data?.error || "Setup'lar yüklenirken bir hata oluştu"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSetups();
  }, [currentCar, setError]);

  const handleCopySetup = (setup: TuningSetup) => {
    const setupText =
      `${setup.car.brand} ${setup.car.model} (${setup.car.year}) - ${setup.name}\n\n` +
      `Tires: Front ${setup.tires.frontPressure.toFixed(
        1
      )} bar, Rear ${setup.tires.rearPressure.toFixed(1)} bar\n` +
      `Gearing: Final Drive ${setup.gearing.finalDrive.toFixed(
        2
      )}, 1st ${setup.gearing.firstGear.toFixed(
        2
      )}, 2nd ${setup.gearing.secondGear.toFixed(2)}, ...\n` +
      `Alignment: Front Camber ${setup.alignment.frontCamber.toFixed(
        1
      )}°, Rear Camber ${setup.alignment.rearCamber.toFixed(1)}°, ...\n` +
      `Anti-roll Bars: Front ${setup.antirollBars.front.toFixed(
        2
      )}, Rear ${setup.antirollBars.rear.toFixed(2)}\n` +
      `Springs: Front ${setup.springs.frontStiffness.toFixed(
        1
      )} kgf/mm, Rear ${setup.springs.rearStiffness.toFixed(1)} kgf/mm, ...\n` +
      `Damping: Front Rebound ${setup.damping.frontReboundStiffness.toFixed(
        1
      )}, Rear Rebound ${setup.damping.rearReboundStiffness.toFixed(
        1
      )}, ...\n` +
      `Aero: Front ${setup.aero.frontDownforce} kgf, Rear ${setup.aero.rearDownforce} kgf\n` +
      `Braking: Balance ${setup.braking.brakeBalance}% front, Pressure ${setup.braking.brakePressure}%\n` +
      `Differential: Accel ${setup.differential.acceleration}%, Decel ${setup.differential.deceleration}%\n\n` +
      `${setup.description}`;

    navigator.clipboard.writeText(setupText);
    toast.success('Setup panoya kopyalandı!');
  };

  if (loading) {
    return <div className='py-4 text-center'>Setup'lar yükleniyor...</div>;
  }

  if (setups.length === 0) {
    return (
      <div className='bg-yellow-50 p-4 rounded-md'>
        <p className='text-yellow-700'>
          Henüz hiç kaydedilmiş setup bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Kaydedilmiş Setup'lar</h2>

      <div className='space-y-4'>
        {setups.map((setup) => (
          <div key={setup.id} className='border rounded-md overflow-hidden'>
            <div
              className='bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition-colors'
              onClick={() => handleCopySetup(setup)}
            >
              <div className='flex justify-between items-center'>
                <h3 className='font-semibold text-lg'>{setup.name}</h3>
                <span className='text-sm text-gray-500'>
                  {new Date(setup.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className='text-sm text-gray-600 mt-1'>
                {setup.car.brand} {setup.car.model} ({setup.car.year})
              </p>
              <p className='mt-2 text-gray-700 line-clamp-2'>{setup.prompt}</p>
            </div>

            {selectedSetup?.id === setup.id && (
              <div className='p-4 border-t'>
                <h4 className='font-medium mb-2'>Açıklama</h4>
                <p className='text-gray-700'>{setup.description}</p>

                <div className='mt-4 grid grid-cols-2 gap-4 text-sm'>
                  {/* Setup detaylarını göster */}
                  {/* Burada tüm tuning ayarlarının detayları gösterilebilir */}
                  <button
                    className='mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md'
                    onClick={() => {
                      // Setup'ı Forza formatında panoya kopyala
                      const setupText =
                        `${setup.car.brand} ${setup.car.model} (${setup.car.year}) - ${setup.name}\n\n` +
                        `Tires: Front ${setup.tires.frontPressure} bar, Rear ${setup.tires.rearPressure} bar\n` +
                        // Diğer tuning ayarları...
                        `${setup.description}`;

                      navigator.clipboard.writeText(setupText);
                      toast.success('Setup panoya kopyalandı!');
                    }}
                  >
                    Setup'ı Kopyala
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
