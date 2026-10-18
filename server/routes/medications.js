const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const { getMedicationPrompt } = require('../prompts/medications');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', zh: 'Simplified Chinese', ko: 'Korean', ar: 'Arabic',
};

router.post('/lookup', async (req, res) => {
  const { medication, language } = req.body;
  if (!medication?.trim()) {
    return res.status(400).json({ message: 'No medication name provided' });
  }

  const langName = LANG_NAMES[language] || 'English';

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1536,
      system: getMedicationPrompt(langName),
      messages: [{ role: 'user', content: `Look up this medication: ${medication}` }],
    });

    const rawText = message.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Medication lookup error:', err.message);
    res.status(500).json({ message: 'Unable to look up medication. Please try again.' });
  }
});

router.post('/lookup-image', upload.single('prescription'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const language = LANG_NAMES[req.body.language] || 'English';
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const mimeType = validTypes.includes(req.file.mimetype) ? req.file.mimetype : 'image/jpeg';

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1536,
      system: getMedicationPrompt(language),
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: req.file.buffer.toString('base64'),
            },
          },
          { type: 'text', text: 'This is a prescription photo. Identify the medication and return the full guide.' },
        ],
      }],
    });

    const rawText = message.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error('Prescription image error:', err.message);
    res.status(500).json({ message: 'Unable to read prescription. Please try again.' });
  }
});

module.exports = router;
