// api/alert.js — sends Telegram message when strong signal fires
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(200).json({ sent: false, reason: 'Telegram not configured — add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to Vercel env vars' });
  }

  try {
    const { signal, entry, sl, tp1, tp2, tp3, score, confidence, tf, price } = req.body;
    const emoji = signal.includes('BUY') ? '🟢' : '🔴';
    const msg = `${emoji} *XAUUSD ${signal}*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📊 Timeframe: *${tf}*\n` +
      `💰 Price: *$${price}*\n` +
      `🎯 Score: *${score}/7*\n` +
      `🤖 AI Confidence: *${confidence}%*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🟡 Entry: *$${entry}*\n` +
      `🔴 Stop Loss: *$${sl}*\n` +
      `🟢 TP1 (1:2): *$${tp1}*\n` +
      `🟢 TP2 (1:3): *$${tp2}*\n` +
      `🟢 TP3 (1:5): *$${tp3}*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `_Not financial advice_`;

    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' })
    });
    const d = await r.json();
    return res.status(200).json({ sent: d.ok, result: d });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
