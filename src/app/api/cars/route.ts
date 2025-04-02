import { NextRequest, NextResponse } from 'next/server';

import { carSchema } from '@/lib/validations/car';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Veri doğrulama
    const validatedData = carSchema.parse(body);

    // Araç kaydını oluştur
    const car = await prisma.car.create({
      data: {
        brand: validatedData.brand,
        model: validatedData.model,
        year: validatedData.year,
        performance: {
          create: {
            power: validatedData.performance.power,
            torque: validatedData.performance.torque,
            weight: validatedData.performance.weight,
            frontWeight: validatedData.performance.frontWeight,
            displacement: validatedData.performance.displacement,
            drivetrain: validatedData.performance.drivetrain,
            category: validatedData.performance.category,
            pi: validatedData.performance.pi,
          },
        },
      },
      include: {
        performance: true,
      },
    });

    return NextResponse.json(car);
  } catch (error: any) {
    console.error('Car creation error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Geçersiz araç verileri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Araç oluşturulurken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      include: {
        performance: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(cars);
  } catch (error: any) {
    console.error('Car fetch error:', error);
    return NextResponse.json(
      { error: 'Araçlar listelenirken bir hata oluştu: ' + error.message },
      { status: 500 }
    );
  }
}
