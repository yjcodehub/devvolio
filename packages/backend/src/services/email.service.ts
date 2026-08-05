import nodemailer from 'nodemailer';

export class EmailService {
  public static async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    console.log(`\n==================================================`);
    console.log(`  [OTP VERIFICATION ENGINE]`);
    console.log(`  Email: ${email}`);
    console.log(`  OTP Code: ${otp}`);
    console.log(`  Expires in: 10 minutes`);
    console.log(`==================================================\n`);

    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"Devvolio SaaS" <${process.env.SMTP_FROM || 'no-reply@devvolio.in'}>`,
          to: email,
          subject: `${otp} is your Devvolio Verification Code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
              <h2 style="color: #6d5dfc; text-align: center;">Devvolio Account Verification</h2>
              <p>Welcome! Your 6-digit OTP verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #111; margin: 20px 0; padding: 15px; background: #f4f4f6; border-radius: 8px;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #666;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
            </div>
          `
        });
      }
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to send email via SMTP, logged to console:', err);
      return true;
    }
  }
}
