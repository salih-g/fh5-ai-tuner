import { z } from 'zod';

export const carSchema = z.object({
  brand: z.string().min(1, 'Marka gereklidir'),
  model: z.string().min(1, 'Model gereklidir'),
  year: z.coerce.number().int().min(1950).max(2025),
  performance: z.object({
    power: z.coerce.number().int().min(1),
    torque: z.coerce.number().int().min(1),
    weight: z.coerce.number().int().min(1),
    frontWeight: z.coerce.number().int().min(1).max(99),
    displacement: z.coerce.number().int().min(1),
    drivetrain: z.enum(['RWD', 'AWD', 'FWD']),
    category: z.string().min(1),
    pi: z.coerce.number().int().min(1),
  }),
});

export const tuningPromptSchema = z.object({
  carId: z.string().min(1),
  prompt: z.string().min(10, 'Tuning açıklaması en az 10 karakter olmalıdır'),
  name: z.string().min(1, 'Setup ismi gereklidir'),
});

export const tuningFeedbackSchema = z.object({
  setupId: z.string().min(1),
  feedback: z.string().min(10, 'Geri bildirim en az 10 karakter olmalıdır'),
});

export type Car = z.infer<typeof carSchema>;
export type TuningPrompt = z.infer<typeof tuningPromptSchema>;
export type TuningFeedback = z.infer<typeof tuningFeedbackSchema>;
