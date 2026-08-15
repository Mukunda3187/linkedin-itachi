import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

app.post('/api/generate-post', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const { images } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided.' });
    }

    const imageParts = images.map((img) => ({
      inline_data: {
        mime_type: img.mimeType || 'image/jpeg',
        data: img.data,
      },
    }));

    const prompt =
      'You are a professional LinkedIn ghostwriter. Look at the attached image(s) and write an engaging, ' +
      'professional LinkedIn post inspired by what you see. Keep it concise, authentic, and include 3-5 relevant hashtags. ' +
      'Return only the post text, nothing else.';

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }, ...imageParts],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text().catch(() => '');
      console.error('Gemini API error:', geminiResponse.status, errText);
      return res.status(502).json({ error: 'AI provider request failed.' });
    }

    const data = await geminiResponse.json();
    const postText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!postText) {
      return res.status(502).json({ error: 'AI provider returned an empty response.' });
    }

    return res.json({ postText: postText.trim() });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Something went wrong on the server.' });
  }
});

// Serve the built frontend (the dist folder created by "npm run build")
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Any route that isn't /api/... should return the frontend's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
