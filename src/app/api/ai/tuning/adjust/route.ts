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
    Motor Hacmi: ${car.performance.displacement} cc
    Çekiş Sistemi: ${car.performance.drivetrain}
    Kategori: ${car.performance.category}
    Performans İndeksi: ${car.performance.pi}
    
    Mevcut Tuning Ayarları:
    ${currentSetupStr}
    
    Kullanıcı Geri Bildirimi: ${feedback}
    
    Lütfen şu formatla bir JSON yanıtı oluştur:
    {
      "tires": { "frontPressure": x.x, "rearPressure": x.x },
      "gearing": { "finalDrive": x.xx, "firstGear": x.xx, ... },
      "alignment": { "frontCamber": x.x, "rearCamber": x.x, ... },
      "antirollBars": { "front": xx.x, "rear": xx.x },
      "springs": { "frontStiffness": xx.x, "rearStiffness": xx.x, "frontHeight": xx.x, "rearHeight": xx.x },
      "damping": { "frontReboundStiffness": xx.x, ... },
      "aero": { "frontDownforce": xxx, "rearDownforce": xxx },
      "braking": { "brakeBalance": xx, "brakePressure": xx },
      "differential": { "acceleration": xx, "deceleration": xx },
      "explanation": "Yapılan değişikliklerin neden yapıldığına dair açıklama"
    }
    
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
