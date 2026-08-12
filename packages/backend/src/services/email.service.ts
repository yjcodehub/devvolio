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
        // A. If the key is an SMTP key (starts with xsmtpsib-), send via Brevo SMTP Relay
        if (apiKey.startsWith('xsmtpsib-')) {
          console.log(`[EmailService] Dispatching via Brevo SMTP Relay (${senderEmail})...`);
          const smtpTransporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
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
        }

        // B. If the key is an HTTP API key (starts with xkeysib-), send via Brevo REST API
        console.log(`[EmailService] Dispatching via Brevo REST API (${senderEmail})...`);
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email }],
            subject,
            htmlContent: htmlBody
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[EmailService] Brevo REST API Error:', res.status, errData);
        } else {
          console.log('[EmailService] OTP Email sent successfully via Brevo REST API');
          return true;
        }
      }

      console.warn('[EmailService] BREVO_API_KEY not configured. OTP code logged to server console above.');
      return true;
    } catch (err) {
      console.error('[EmailService] Failed to send OTP email:', err);
      return false;
    }
  }
}


