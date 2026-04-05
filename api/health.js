module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'Gold Trader Pro proxy is running', endpoint: '/api/claude' });
};
