// api/claude.js — Vercel Serverless Function
// CommonJS syntax (no ES module issues)
// This runs SERVER-SIDE — no CORS problems

module.exports = async function handler(req, res) {

  // CORS — allow any origin so GitHub Pages can call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Browser preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not set. Go to Vercel → Project → Settings → Environment Variables and add it.'
    });
  }

  try {
    const body = req.body || {};
    if (!body.messages) {
      return res.status(400).json({ error: 'Missing messages array in request body' });
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: body.max_tokens || 500,
        system: body.system || 'You are a professional XAUUSD technical analyst.',
        messages: body.messages,
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || 'Anthropic error', details: data });
    }
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
};
