import { NextRequest, NextResponse } from 'next/server';

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { car, currentSetup, feedback } = body;

    if (!car || !currentSetup || !feedback) {
      return NextResponse.json(
        { error: 'Araç bilgileri, mevcut ayarlar ve geri bildirim gereklidir' },
        { status: 400 }
      );
    }

    // Mevcut ayarları JSON formatında hazırla
    const currentSetupStr = JSON.stringify(currentSetup, null, 2);

    // AI servisine gönderilecek verileri hazırla
    const message = `
    Bu bir Forza Horizon 5 araç tuning düzeltme talebidir. Kullanıcı aşağıdaki mevcut tuning ayarlarını kullanıcı geri bildirimine göre güncellemenizi istiyor:
    
    Araç Bilgileri:
    Marka: ${car.brand}
    Model: ${car.model}
    Yıl: ${car.year}
    Beygir Gücü: ${car.performance.power} hp
    Tork: ${car.performance.torque} N-m
    Ağırlık: ${car.performance.weight} kg
    Ön Ağırlık Dağılımı: ${car.performance.frontWeight}%
    Arka Ağırlık Dağılımı: ${
      car.performance.rearWeight || 100 - car.performance.frontWeight
    }%
    Motor Hacmi: ${car.performance.displacement} cc
    Çekiş Sistemi: ${car.performance.drivetrain}
    Motor Konumu: ${car.performance.enginePosition || 'Bilinmiyor'}
    Besleme Tipi: ${car.performance.aspiration || 'Bilinmiyor'}
    Silindir Sayısı: ${car.performance.cylinders || 'Bilinmiyor'}
    Kategori: ${car.performance.category}
    Performans İndeksi: ${car.performance.pi}
    
    Mevcut Tuning Ayarları:
    ${currentSetupStr}
    
    Kullanıcı Geri Bildirimi: ${feedback}
    
    Lütfen şu formatla bir JSON yanıtı oluştur:
    {
      "tires": {
        "frontPressure": x.x, 
        "rearPressure": x.x,
        "frontWidth": xxx (opsiyonel, mm cinsinden),
        "rearWidth": xxx (opsiyonel, mm cinsinden),
        "frontProfile": xx (opsiyonel, % cinsinden),
        "rearProfile": xx (opsiyonel, % cinsinden),
        "frontRimSize": xx (opsiyonel, inç cinsinden),
        "rearRimSize": xx (opsiyonel, inç cinsinden),
        "compound": "lastik tipi" (opsiyonel, Stock, Street, Sport, Race, Drag, Rally, Drift, Offroad)
      },
      "gearing": {
        "finalDrive": x.xx, 
        "firstGear": x.xx, 
        "secondGear": x.xx, 
        "thirdGear": x.xx, 
        "fourthGear": x.xx, 
        "fifthGear": x.xx, 
        "sixthGear": x.xx (opsiyonel), 
        "seventhGear": x.xx (opsiyonel), 
        "eighthGear": x.xx (opsiyonel), 
        "ninthGear": x.xx (opsiyonel), 
        "tenthGear": x.xx (opsiyonel),
        "gearCount": x (opsiyonel),
        "topSpeed": xxx (opsiyonel, km/h cinsinden)
      },
      "alignment": {
        "frontCamber": x.x, 
        "rearCamber": x.x, 
        "frontToe": x.x, 
        "rearToe": x.x, 
        "frontCaster": x.x
      },
      "antirollBars": {
        "front": xx.x, 
        "rear": xx.x
      },
      "springs": {
        "frontStiffness": xx.x, 
        "rearStiffness": xx.x, 
        "frontHeight": xx.x, 
        "rearHeight": xx.x,
        "springType": "yay tipi" (opsiyonel, Stock, Race, Rally, Drift, Offroad)
      },
      "damping": {
        "frontReboundStiffness": xx.x,
        "rearReboundStiffness": xx.x,
        "frontBumpStiffness": xx.x,
        "rearBumpStiffness": xx.x
      },
      "aero": {
        "frontDownforce": xxx,
        "rearDownforce": xxx
      },
      "braking": {
        "brakeBalance": xx,
        "brakePressure": xx,
        "brakeType": "fren tipi" (opsiyonel, Stock, Street, Race, Rally, Drift)
      },
      "differential": {
        ${
          car.performance.drivetrain === 'AWD' ||
          car.performance.drivetrain === 'FWD'
            ? '"frontAccel": xx,'
            : ''
        }
        ${
          car.performance.drivetrain === 'AWD' ||
          car.performance.drivetrain === 'FWD'
            ? '"frontDecel": xx,'
            : ''
        }
        "rearAccel": xx,
        "rearDecel": xx,
        ${car.performance.drivetrain === 'AWD' ? '"center": xx,' : ''}
        "diffType": "diferansiyel tipi" (opsiyonel, Stock, Race, Rally, Drift, Offroad)
      },
      "engine": {
        "intakeLevel": x (opsiyonel, 0-5 arası),
        "exhaustLevel": x (opsiyonel, 0-5 arası),
        "camshaftLevel": x (opsiyonel, 0-5 arası),
        "valvesLevel": x (opsiyonel, 0-5 arası),
        "engineBlockLevel": x (opsiyonel, 0-5 arası),
        "pistonLevel": x (opsiyonel, 0-5 arası),
        "turboLevel": x (opsiyonel, 0-5 arası, ${
          car.performance.aspiration?.includes('Turbo')
            ? 'mevcut besleme türü Turbo/Twin-turbo'
            : 'NA/Supercharged besleme'
        }),
        "intercoolerLevel": x (opsiyonel, 0-5 arası),
        "oilLevel": x (opsiyonel, 0-5 arası),
        "flyWheelLevel": x (opsiyonel, 0-5 arası),
        "ignitionLevel": x (opsiyonel, 0-5 arası)
      },
      "explanation": "Yapılan değişikliklerin neden yapıldığına dair açıklama"
    }
    
    Kullanıcının geri bildirimine göre hangi parametrelerin değiştirilmesi gerekiyorsa sadece o parametreleri değiştir, diğer parametreleri mevcut tuningdeki değerlerle aynı bırak.
    Mevcut tuningde olmayan parametreler için değer belirtmene gerek yok.
    
    FH5'teki gerçek tuning değerlerini bildiğinden emin ol:
    - Çekiş tipine göre (FWD, RWD, AWD) uygun diferansiyel ayarları ver
    - Ön/arka ağırlık dağılımına göre uygun yay ve antiroll bar değerleri belirle
    - Motor konumuna göre (Ön, Orta, Arka) uygun ağırlık transferi ayarları ver
    - Körükörüne rakamlar verme, gerçekçi ve dengeli değerler sağla
    
    Sadece JSON döndür, başka bir açıklama ekleme.
    `;

    // Claude AI'ye istek gönder
    const aiResponse = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
        },
      ],
      system:
        'Sen Forza Horizon 5 oyununda uzmanlaşmış bir tuning asistanısın. Kullanıcıların mevcut tuning ayarlarını geri bildirimlere göre optimize edersin. Yanıtlarını her zaman JSON formatında ver.',
    });

    // AI'nin yanıtını parse et
    const block = aiResponse.content[0];
    const responseContent =
      'type' in block && block.type === 'text' ? block.text : '';
    if (!responseContent) {
      throw new Error('AI yanıtı boş geldi');
    }

    // İlk JSON başlangıcını ve son JSON sonunu bul
    const jsonStartIndex = responseContent.indexOf('{');
    const jsonEndIndex = responseContent.lastIndexOf('}') + 1;

    if (jsonStartIndex === -1 || jsonEndIndex === 0) {
      throw new Error('Yanıtta geçerli bir JSON bulunamadı');
    }

    const jsonString = responseContent.substring(jsonStartIndex, jsonEndIndex);
    const tuningData = JSON.parse(jsonString);

    return NextResponse.json(tuningData);
  } catch (error: any) {
    console.error('Tuning Adjustment AI Error:', error);
    return NextResponse.json(
      { error: 'Tuning düzenlenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
