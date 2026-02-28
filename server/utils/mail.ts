import nodemailer from 'nodemailer'

let _transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (_transporter) return _transporter
  const config = useRuntimeConfig()
  _transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: Number(config.smtpPort) === 465,
    auth: config.smtpUser
      ? { user: config.smtpUser, pass: config.smtpPass }
      : undefined,
  })
  return _transporter
}

export async function sendOtpEmail(to: string, code: string, appName = 'SnapCMS') {
  const config = useRuntimeConfig()
  const transporter = getTransporter()

  await transporter.sendMail({
    from: config.smtpFrom || `${appName} <noreply@snapcms.io>`,
    to,
    subject: `Your ${appName} sign-in code: ${code}`,
    text: `Your sign-in code is: ${code}\n\nIt expires in 15 minutes. Do not share it.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#18181b">${appName}</h2>
        <p>Your sign-in code is:</p>
        <div style="font-size:42px;font-weight:700;letter-spacing:8px;color:#18181b;padding:16px 0">${code}</div>
        <p style="color:#71717a;font-size:14px">Expires in 15 minutes. Do not share this code.</p>
      </div>
    `,
  })
}
