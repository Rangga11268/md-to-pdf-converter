module.exports = (req, res) => {
    res.json({ status: 'ok', environment: process.env.VERCEL ? 'vercel' : 'local' });
};
