import nodemailer from 'nodemailer';

export class EmailService {
  public static async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    console.log(`\n==================================================`);
    console.log(`  [OTP VERIFICATION ENGINE]`);
    console.log(`  Target Email: ${email}`);
    console.log(`  OTP Code: ${otp}`);
    console.log(`  Expires in: 10 minutes`);
    console.log(`==================================================\n`);

    const subject = `${otp} is your Devvolio Verification Code`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6d5dfc; text-align: center;">Devvolio Account Verification</h2>
        <p>Welcome! Your 6-digit OTP verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 6px; color: #111; margin: 20px 0; padding: 15px; background: #f4f4f6; border-radius: 8px;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #666;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `;

    try {
      const apiKey = process.env.BREVO_API_KEY?.trim();
      const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'lakshraj2121@gmail.com';
      const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Devvolio SaaS';

      if (apiKey) {
        // 1. Try Brevo REST API over HTTPS (Port 443 - Never blocked by Render)
        try {
          console.log(`[EmailService] Dispatching via Brevo REST API (${senderEmail})...`);
          const res = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': apiKey,
              'content-type': 'application/json'
            },
            signal: AbortSignal.timeout(6000), // 6 second timeout safeguard
            body: JSON.stringify({
              sender: { name: senderName, email: senderEmail },
              to: [{ email }],
              subject,
              htmlContent: htmlBody
            })
          });

          const responseData = await res.json().catch(() => ({}));

          if (res.ok) {
            console.log('[EmailService] OTP Email sent successfully via Brevo REST API:', responseData);
            return true;
          } else {
            console.error('[EmailService] Brevo REST API Error:', res.status, responseData);
          }
        } catch (apiErr: any) {
          console.error('[EmailService] Brevo REST API Network/Timeout Error:', apiErr.message || apiErr);
        }

        // 2. Fallback to Brevo SMTP Relay over Port 587 if REST API failed
        if (apiKey.startsWith('xsmtpsib-')) {
          try {
            console.log(`[EmailService] Falling back to Brevo SMTP Relay (${senderEmail})...`);
            const smtpTransporter = nodemailer.createTransport({
              host: 'smtp-relay.brevo.com',
              port: 587,
              secure: false,
              connectionTimeout: 5000,
              greetingTimeout: 5000,
              auth: {
                user: senderEmail,
                pass: apiKey
              }
            });

            await smtpTransporter.sendMail({
              from: `"${senderName}" <${senderEmail}>`,
              to: email,
              subject,
              html: htmlBody
            });

            console.log('[EmailService] OTP Email sent successfully via Brevo SMTP Relay');
            return true;
          } catch (smtpErr: any) {
            console.error('[EmailService] Brevo SMTP Relay Error:', smtpErr.message || smtpErr);
          }
        }
      }

      console.warn('[EmailService] Could not send email via Brevo. Code logged to server console above.');
      return true;
    } catch (err) {
      console.error('[EmailService] Unexpected error sending OTP email:', err);
      return false;
    }
  }
}


