import { z } from 'zod';
// ======================
export const LoginSchema = z.object({
  email: z
    .string({ error: 'البريد الالكتروني يجب أن يكون نصاً' })
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email({ message: 'يرجى إدخال بريد إلكتروني صحيح' }),

  password: z
    .string({ error: 'كلمة المرور يجب أن تكون نصاً' })
    .min(8, 'يجب ألا تقل كلمة المرور عن 8 أحرف')
    .max(50, 'يجب ألا تزيد كلمة المرور عن 50 حرفًا'),
});

export type LoginDto = z.infer<typeof LoginSchema>;
