// api/claude.js — Vercel serverless function
// This runs SERVER-SIDE so CORS is not an issue
// Deploy this to Vercel, then point your app at it

export default async function handler(req, res) {
  // Allow requests from your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', 'https://emma-2020.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get your Anthropic key from Vercel environment variable (never exposed to browser)
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'Server not configured — add ANTHROPIC_API_KEY to Vercel env vars' });
  }

  try {
    const { messages, max_tokens, system } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 500,
        system: system || 'You are a professional XAUUSD technical analyst.',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Anthropic API error' });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
