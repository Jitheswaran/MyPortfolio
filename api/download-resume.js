const fs = require('fs');
const path = require('path');
const { setCors, handleOptions, verifyDownloadToken } = require('../lib/helpers');

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.DOWNLOAD_TOKEN_SECRET) {
      return res.status(500).json({ error: 'Server is missing download configuration.' });
    }

    const token = req.query && req.query.token ? String(req.query.token) : '';
    const payload = verifyDownloadToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired download link. Please verify your email again.' });
    }

    const pdfPath = path.join(process.cwd(), 'private', 'Jitheswaran_Bhoopaul_Resume.pdf');
    if (!fs.existsSync(pdfPath)) {
      console.error('Resume PDF missing at', pdfPath);
      return res.status(404).json({ error: 'Resume file not found on server.' });
    }

    const pdf = fs.readFileSync(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Jitheswaran_Bhoopaul_Resume.pdf"');
    res.setHeader('Content-Length', pdf.length);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(pdf);
  } catch (err) {
    console.error('download-resume error:', err);
    return res.status(500).json({ error: 'Failed to download resume.' });
  }
};
