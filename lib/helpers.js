const crypto = require('crypto');
const { Redis } = require('@upstash/redis');
const { Resend } = require('resend');

function toBase64Url(value) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value) {
  var padded = value.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) padded += '=';
  return Buffer.from(padded, 'base64').toString('utf8');
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleOptions(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

function getRedis() {
  return Redis.fromEnv();
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function getFromEmail() {
  return process.env.FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';
}

function getOwnerEmail() {
  return process.env.OWNER_EMAIL || 'jitheswaran2091999@gmail.com';
}

function getTokenSecret() {
  var secret = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!secret) {
    throw new Error('DOWNLOAD_TOKEN_SECRET is not configured');
  }
  return secret;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function otpKey(email) {
  return 'otp:' + normalizeEmail(email);
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signDownloadToken(payload) {
  var secret = getTokenSecret();
  var data = toBase64Url(JSON.stringify(payload));
  var sig = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return data + '.' + sig;
}

function verifyDownloadToken(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) {
    return null;
  }
  var secret = getTokenSecret();
  var parts = token.split('.');
  var data = parts[0];
  var sig = parts[1];
  var expected = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  var sigBuf = Buffer.from(sig);
  var expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    var payload = JSON.parse(fromBase64Url(data));
    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return {};
}

module.exports = {
  setCors,
  handleOptions,
  getRedis,
  getResend,
  getFromEmail,
  getOwnerEmail,
  getTokenSecret,
  normalizeEmail,
  isValidEmail,
  otpKey,
  generateOtp,
  signDownloadToken,
  verifyDownloadToken,
  readJsonBody
};
