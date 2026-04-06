import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      '[mailer] SMTP env vars not set — falling back to console transport. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to send real emails.'
    );
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const t = getTransporter();
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'no-reply@marvinsden.local';
  const info = await t.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text || opts.html.replace(/<[^>]+>/g, ''),
  });
  if ((info as any).message) {
    console.log('[mailer:dev]', (info as any).message.toString());
  }
  return info;
}

export async function sendOtpEmail(to: string, otp: string, purpose = 'verification') {
  const subject = `Your Marvin's Den ${purpose} code`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <h2 style="color:#27ae60;margin-top:0">Marvin's Den</h2>
      <p>Your ${purpose} code is:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:6px;text-align:center;background:#f6f6f6;padding:16px;border-radius:6px">${otp}</p>
      <p style="color:#888;font-size:12px">This code will expire in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
  return sendMail({ to, subject, html });
}
