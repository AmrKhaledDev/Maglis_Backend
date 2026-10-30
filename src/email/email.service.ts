import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import nodemailer from 'nodemailer';
// ======================================
@Injectable()
export class EmailService {
  private readonly logger = new Logger();
  async sendEmail(
    email: string,
    name: string,
    verificationToken: string,
    html?: string,
  ) {
    if (!email.trim() || !verificationToken.trim() || !name.trim())
      throw new BadRequestException(
        'تعذر إرسال رابط التحقق. حاول مرة أخرى لاحقاً',
      );
    try {
      const transporter = nodemailer.createTransport({
        secure: true,
        port: 465,
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASS,
        },
      });
      const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
      await transporter.sendMail({
        from: '" Maglis " <no-reply@maro.vip53@gmail.com>',
        to: email,
        subject: '🔑 تفعيل حسابك - خطوة واحدة وتبدأ رحلتك معنا',
        html: `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
      <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 35px 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">تأكيد البريد الإلكتروني</h2>
      </div>
      
      <div style="padding: 30px 25px; text-align: right; color: #334155;">
        <p style="font-size: 16px; margin-bottom: 10px; color: #0f172a;">مرحباً <b>${name}</b>،</p>
        <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 25px;">
          سعداء بانضمامك إلينا! لتفعيل حسابك والبدء في استخدام المنصة بشكل آمن، يرجى الضغط على زر التفعيل بالأسفل:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            تفعيل الحساب الآن
          </a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 25px 0;" />
        <p style="font-size: 12px; line-height: 1.5; color: #94a3b8;">
          إذا واجهتك مشكلة في الضغط على الزر، يمكنك نسخ الرابط التالي ولصقه في متصفحك:
          <br />
          <a href="${verificationUrl}" style="color: #2563eb; text-decoration: none; word-break: break-all; display: block; margin-top: 5px; font-family: monospace;">
            ${verificationUrl}
          </a>
        </p>
      </div>
    </div>
  `,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'تعذر إرسال رابط التحقق. حاول مرة أخرى لاحقًا',
      );
    }
  }
}
