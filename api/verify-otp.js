const {
  setCors,
  handleOptions,
  getRedis,
  getResend,
  getFromEmail,
  getOwnerEmail,
  normalizeEmail,
  isValidEmail,
  otpKey,
  signDownloadToken,
  readJsonBody
} = require('../lib/helpers');

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (
      !process.env.RESEND_API_KEY ||
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN ||
      !process.env.DOWNLOAD_TOKEN_SECRET
    ) {
      return res.status(500).json({ error: 'Server is missing OTP/download configuration.' });
    }

    const body = readJsonBody(req);
    const email = normalizeEmail(body.email);
    const otp = String(body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const redis = getRedis();
    const key = otpKey(email);
    const stored = await redis.get(key);

    if (!stored) {
      return res.status(400).json({ error: 'OTP expired or not found. Please request a new code.' });
    }

    const record = typeof stored === 'string' ? JSON.parse(stored) : stored;
    if (!record || String(record.otp) !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    await redis.del(key);

    const resend = getResend();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    await resend.emails.send({
      from: getFromEmail(),
      to: getOwnerEmail(),
      subject: 'Resume downloaded: ' + record.firstName + ' ' + record.lastName,
      html:
        '<h2>Someone verified their email and downloaded your resume</h2>' +
        '<ul>' +
        '<li><strong>First name:</strong> ' + record.firstName + '</li>' +
        '<li><strong>Last name:</strong> ' + record.lastName + '</li>' +
        '<li><strong>Email:</strong> ' + record.email + '</li>' +
        '<li><strong>Company:</strong> ' + record.company + '</li>' +
        '<li><strong>Role:</strong> ' + record.role + '</li>' +
        '<li><strong>Time (IST):</strong> ' + timestamp + '</li>' +
        '</ul>'
    });

    const token = signDownloadToken({
      email: record.email,
      exp: Date.now() + 10 * 60 * 1000
    });

    return res.status(200).json({
      ok: true,
      token: token,
      message: 'Email verified. Starting download.'
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
};
