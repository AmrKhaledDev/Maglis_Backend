import { z } from 'zod';
// ======================
export const RegisterSchema = z
  .object({
    name: z
      .string({ error: 'الاسم يجب أن يكون نصاً' })
      .trim()
      .min(3, 'يجب ألا يقل الاسم عن 3 أحرف')
      .max(40, 'يجب ألا يزيد الاسم عن 40 حرفًا'),

    email: z
      .string({ error: 'البريد الالكتروني يجب أن يكون نصاً' })
      .trim()
      .min(1, 'البريد الإلكتروني مطلوب')
      .email({ message: 'يرجى إدخال بريد إلكتروني صحيح' }),

    password: z
      .string({ error: 'كلمة المرور يجب أن تكون نصاً' })
      .min(8, 'يجب ألا تقل كلمة المرور عن 8 أحرف')
      .max(50, 'يجب ألا تزيد كلمة المرور عن 50 حرفًا'),

    confirmPassword: z.string({ error: 'تأكيد كلمة المرور مطلوبة' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'كلمتا المرور غير متطابقتان.',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterDto = z.infer<typeof RegisterSchema>;
