const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const { getDocumentPrompt } = require('../prompts/documents');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', zh: 'Simplified Chinese', ko: 'Korean', ar: 'Arabic',
};

router.post('/analyze', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const language = LANG_NAMES[req.body.language] || 'English';
  const fileBuffer = req.file.buffer;
  const mimeType = req.file.mimetype;

  try {
    let contentBlocks;

    if (mimeType === 'application/pdf') {
      contentBlocks = [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: fileBuffer.toString('base64'),
          },
        },
        { type: 'text', text: 'Please analyze this medical document and return the JSON response as instructed.' },
      ];
    } else {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const imgType = validImageTypes.includes(mimeType) ? mimeType : 'image/jpeg';
      contentBlocks = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imgType,
            data: fileBuffer.toString('base64'),
          },
        },
        { type: 'text', text: 'Please analyze this medical document image and return the JSON response as instructed.' },
      ];
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: getDocumentPrompt(language),
      messages: [{ role: 'user', content: contentBlocks }],
    });

    const rawText = message.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Document analysis error:', err.message);
    res.status(500).json({ message: 'Unable to analyze document. Please try again.' });
  }
});

module.exports = router;
