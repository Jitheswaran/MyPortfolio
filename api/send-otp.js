const {
  setCors,
  handleOptions,
  getRedis,
  getResend,
  getFromEmail,
  normalizeEmail,
  isValidEmail,
  otpKey,
  generateOtp,
  readJsonBody
} = require('../lib/helpers');

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.RESEND_API_KEY || !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return res.status(500).json({ error: 'Server is missing email/OTP configuration.' });
    }

    const body = readJsonBody(req);
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = normalizeEmail(body.email);
    const company = String(body.company || '').trim();
    const role = String(body.role || '').trim();

    if (!firstName || !lastName || !email || !company || !role) {
      return res.status(400).json({ error: 'All fields are required: first name, last name, email, company, and role.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const otp = generateOtp();
    const redis = getRedis();
    await redis.set(
      otpKey(email),
      JSON.stringify({ otp, firstName, lastName, email, company, role }),
      { ex: 600 }
    );

    const resend = getResend();
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'Your OTP to download Jitheswaran\'s resume',
      html:
        '<p>Hello ' + firstName + ',</p>' +
        '<p>Your one-time password (OTP) to download the resume is:</p>' +
        '<p style="font-size:24px;font-weight:700;letter-spacing:4px;">' + otp + '</p>' +
        '<p>This code expires in 10 minutes.</p>' +
        '<p>If you did not request this, you can ignore this email.</p>'
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({
        error: 'Could not send OTP email. The site owner may need to verify a Resend sending domain.'
      });
    }

    return res.status(200).json({ ok: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
};
