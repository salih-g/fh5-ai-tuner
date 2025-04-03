import { z } from 'zod';

export const drivetrainEnum = z.enum(['RWD', 'AWD', 'FWD']);
export const enginePositionEnum = z.enum(['Front', 'Mid', 'Rear']);
export const aspirationEnum = z.enum([
  'NA',
  'Turbo',
  'Twin-turbo',
  'Supercharged',
]);
export const tireCompoundEnum = z.enum([
  'Stock',
  'Street',
  'Sport',
  'Race',
  'Drag',
  'Rally',
  'Drift',
  'Offroad',
]);
export const springTypeEnum = z.enum([
  'Stock',
  'Race',
  'Rally',
  'Drift',
  'Offroad',
]);
export const brakeTypeEnum = z.enum([
  'Stock',
  'Street',
  'Race',
  'Rally',
  'Drift',
]);
export const diffTypeEnum = z.enum([
  'Stock',
  'Race',
  'Rally',
  'Drift',
  'Offroad',
]);

export const carSchema = z.object({
  brand: z.string().min(1, 'Marka gereklidir'),
  model: z.string().min(1, 'Model gereklidir'),
  year: z.coerce.number().int().min(1950).max(2025),
  performance: z
    .object({
      power: z.coerce.number().int().min(1, 'Beygir gücü en az 1 olmalıdır'),
      torque: z.coerce.number().int().min(1, 'Tork en az 1 olmalıdır'),
      weight: z.coerce
        .number()
        .int()
        .min(100, 'Ağırlık en az 100 kg olmalıdır'),
      frontWeight: z.coerce
        .number()
        .int()
        .min(1)
        .max(99, 'Ön ağırlık dağılımı 1-99 arası olmalıdır'),
      rearWeight: z.coerce
        .number()
        .int()
        .min(1)
        .max(99, 'Arka ağırlık dağılımı 1-99 arası olmalıdır'),
      displacement: z.coerce
        .number()
        .int()
        .min(1, 'Motor hacmi en az 1 cc olmalıdır'),
      drivetrain: drivetrainEnum,
      category: z.string().min(1, 'Kategori gereklidir'),
      pi: z.coerce
        .number()
        .int()
        .min(1)
        .max(999, 'PI değeri 1-999 arası olmalıdır'),
      enginePosition: enginePositionEnum,
      aspiration: aspirationEnum,
      cylinders: z.coerce.number().int().min(1).max(16).optional(),
      stockTopSpeed: z.coerce.number().int().min(1).optional(),
      stockAccel: z.coerce.number().min(0.1).optional(),
    })
    .refine((data) => data.frontWeight + data.rearWeight === 100, {
      message: 'Ön ve arka ağırlık toplamı 100 olmalıdır',
      path: ['frontWeight', 'rearWeight'],
    }),
});

export const tuningPromptSchema = z.object({
  carId: z.string().min(1),
  prompt: z.string().min(10, 'Tuning açıklaması en az 10 karakter olmalıdır'),
  name: z.string().min(1, 'Setup ismi gereklidir'),
  setupType: z
    .enum(['Pist', 'Ralli', 'Drift', 'Drag', 'Offroad', 'Cruise', 'Genel'])
    .optional(),
});

export const tuningFeedbackSchema = z.object({
  setupId: z.string().min(1),
  feedback: z.string().min(10, 'Geri bildirim en az 10 karakter olmalıdır'),
});

// Tam tuning setup şeması (kaydetme için)
export const fullTuningSetupSchema = z.object({
  name: z.string().min(1, 'Setup ismi gereklidir'),
  carId: z.string().min(1, 'Araç ID gereklidir'),
  prompt: z.string().min(10, 'Tuning açıklaması en az 10 karakter olmalıdır'),
  setupType: z
    .enum(['Pist', 'Ralli', 'Drift', 'Drag', 'Offroad', 'Cruise', 'Genel'])
    .optional(),

  tires: z.object({
    frontPressure: z.number().min(1.0).max(3.5),
    rearPressure: z.number().min(1.0).max(3.5),
    frontWidth: z.number().optional(),
    rearWidth: z.number().optional(),
    frontProfile: z.number().optional(),
    rearProfile: z.number().optional(),
    frontRimSize: z.number().optional(),
    rearRimSize: z.number().optional(),
    compound: z.string().optional(),
  }),

  gearing: z.object({
    finalDrive: z.number().min(1.0).max(10.0),
    firstGear: z.number().min(1.0).max(10.0),
    secondGear: z.number().min(1.0).max(10.0),
    thirdGear: z.number().min(1.0).max(10.0),
    fourthGear: z.number().min(1.0).max(10.0),
    fifthGear: z.number().min(1.0).max(10.0),
    sixthGear: z.number().optional(),
    seventhGear: z.number().optional(),
    eighthGear: z.number().optional(),
    ninthGear: z.number().optional(),
    tenthGear: z.number().optional(),
    gearCount: z.number().min(3).max(10),
    topSpeed: z.number().optional(),
  }),

  alignment: z.object({
    frontCamber: z.number().min(-5.0).max(5.0),
    rearCamber: z.number().min(-5.0).max(5.0),
    frontToe: z.number().min(-5.0).max(5.0),
    rearToe: z.number().min(-5.0).max(5.0),
    frontCaster: z.number().min(0.0).max(10.0),
  }),

  antirollBars: z.object({
    front: z.number().min(1.0).max(65.0),
    rear: z.number().min(1.0).max(65.0),
  }),

  springs: z.object({
    frontStiffness: z.number().min(1.0).max(200.0),
    rearStiffness: z.number().min(1.0).max(200.0),
    frontHeight: z.number().min(1.0).max(30.0),
    rearHeight: z.number().min(1.0).max(30.0),
    springType: z.string().optional(),
  }),

  damping: z.object({
    frontReboundStiffness: z.number().min(1.0).max(20.0),
    rearReboundStiffness: z.number().min(1.0).max(20.0),
    frontBumpStiffness: z.number().min(1.0).max(20.0),
    rearBumpStiffness: z.number().min(1.0).max(20.0),
  }),

  aero: z.object({
    frontDownforce: z.number().min(0).max(500),
    rearDownforce: z.number().min(0).max(500),
  }),

  braking: z.object({
    brakeBalance: z.number().min(0).max(100),
    brakePressure: z.number().min(0).max(100),
    brakeType: z.string().optional(),
  }),

  differential: z.object({
    frontAccel: z.number().min(0).max(100).optional(),
    frontDecel: z.number().min(0).max(100).optional(),
    rearAccel: z.number().min(0).max(100),
    rearDecel: z.number().min(0).max(100),
    center: z.number().min(0).max(100).optional(),
    diffType: z.string().optional(),
  }),

  engine: z
    .object({
      intakeLevel: z.number().min(0).max(5).optional(),
      exhaustLevel: z.number().min(0).max(5).optional(),
      camshaftLevel: z.number().min(0).max(5).optional(),
      valvesLevel: z.number().min(0).max(5).optional(),
      engineBlockLevel: z.number().min(0).max(5).optional(),
      pistonLevel: z.number().min(0).max(5).optional(),
      turboLevel: z.number().min(0).max(5).optional(),
      intercoolerLevel: z.number().min(0).max(5).optional(),
      oilLevel: z.number().min(0).max(5).optional(),
      flyWheelLevel: z.number().min(0).max(5).optional(),
      ignitionLevel: z.number().min(0).max(5).optional(),
    })
    .optional(),

  explanation: z.string().min(1, 'Açıklama gereklidir'),
});

export type Car = z.infer<typeof carSchema>;
export type TuningPrompt = z.infer<typeof tuningPromptSchema>;
export type TuningFeedback = z.infer<typeof tuningFeedbackSchema>;
export type FullTuningSetup = z.infer<typeof fullTuningSetupSchema>;
