import { MediaType, Privacy } from '@prisma/client';
import z from 'zod';
// =======================================
export const CreatePostSchema = z
  .object({
    content: z
      .string({ message: 'المحتوى النصي للمنشور يجب أن يكون نصاً.' })
      .trim()
      .max(2000, {
        message: 'محتوى المنشور طويل للغاية يجب ألا يزيد عن 2000 كلمة.',
      })
      .optional(),
    media: z
      .array(
        z.object({
          url: z.string({ message: 'رابط الصورة يجب أن يكون نصاً' }),
          type: z.enum(MediaType, {
            message: 'يتعذر انشاء منشور. يوجد ملف نوعه غير مدعوم.',
          }),
        }),
      )
      .optional(),
      
    privacy: z
      .enum(Privacy, {
        message: 'يرجى اختيار مستوى خصوصية صحيح (عام، أصدقاء، أو خاص)',
      })
      .default('FRIENDS'),

    commentsDisabled: z
      .boolean({
        message:
          'قيمة تعطيل التعليقات يجب أن تكون صحيحة أو خاطئة (True أو False).',
      })
      .optional(),

    isPinnedToProfile: z
      .boolean({
        message:
          'قيمة التثبيت في الملف الشخصي يجب أن تكون صحيحة أو خاطئة (True أو False).',
      })
      .optional(),

    showMediaInProfile: z
      .boolean({
        message:
          'قيمة إظهار الوسائط يجب أن تكون صحيحة أو خاطئة (True أو False).',
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.content && (!data.media || data.media.length < 1)) {
      ctx.addIssue({
        code: 'custom',
        message: 'لا يمكنك إنشاء منشور فارغ.',
      });
    }
  });

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
