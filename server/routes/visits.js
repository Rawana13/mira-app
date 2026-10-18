const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const Groq = require('groq-sdk');
const { toFile } = require('groq-sdk');
const { getAfterVisitPrompt, getBeforeVisitPrompt } = require('../prompts/visits');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const LANG_NAMES = {
  en: 'English', hi: 'Hindi', zh: 'Simplified Chinese', ko: 'Korean', ar: 'Arabic',
};

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No audio file provided' });

  try {
    const ext = req.file.mimetype.includes('mp4') ? 'm4a' : 'webm';
    const file = await toFile(req.file.buffer, `recording.${ext}`, { type: req.file.mimetype });
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      response_format: 'text',
    });
    res.json({ transcript: typeof transcription === 'string' ? transcription : transcription.text });
  } catch (err) {
    console.error('Transcription error:', err.message);
    res.status(500).json({ message: 'Transcription failed. Please try again.' });
  }
});

router.post('/summarize', async (req, res) => {
  const { notes, mode, language } = req.body;
  if (!notes?.trim()) return res.status(400).json({ message: 'No notes provided' });

  const langName = LANG_NAMES[language] || 'English';
  const systemPrompt = mode === 'after' ? getAfterVisitPrompt(langName) : getBeforeVisitPrompt(langName);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: notes }],
    });

    const rawText = message.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error('Visit summary error:', err.message);
    res.status(500).json({ message: 'Unable to generate summary. Please try again.' });
  }
});

module.exports = router;
