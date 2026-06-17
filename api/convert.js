// api/convert.js — Vercel Proxy Handler
// Meneruskan request ke PDF Server eksternal (Render.com)

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // URL PDF server eksternal — set via Environment Variable di Vercel Dashboard
    const PDF_SERVER_URL = process.env.PDF_SERVER_URL;

    if (!PDF_SERVER_URL) {
        return res.status(500).json({
            error: 'PDF_SERVER_URL environment variable belum dikonfigurasi.',
            fallback: true
        });
    }

    try {
        const { markdown, fontFamily, fontSize, lineHeight, marginTB, marginLR, headingColor } = req.body;

        if (!markdown) {
            return res.status(400).json({ error: 'Konten Markdown tidak boleh kosong.' });
        }

        // Forward ke PDF server eksternal
        const targetUrl = `${PDF_SERVER_URL.replace(/\/$/, '')}/convert`;
        console.log(`Meneruskan request PDF ke: ${targetUrl}`);

        const pdfResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown, fontFamily, fontSize, lineHeight, marginTB, marginLR, headingColor }),
            // Timeout 25 detik (Vercel max 30 detik untuk hobby)
            signal: AbortSignal.timeout(25000)
        });

        if (!pdfResponse.ok) {
            let errMsg = 'PDF server mengembalikan error.';
            try {
                const errData = await pdfResponse.json();
                errMsg = errData.error || errMsg;
            } catch (e) {}
            return res.status(pdfResponse.status).json({ error: errMsg, fallback: true });
        }

        const pdfBuffer = await pdfResponse.arrayBuffer();

        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Error saat proxy ke PDF server:', error);

        // Jika timeout atau server tidur (cold start), fallback ke print browser
        const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError';
        return res.status(503).json({
            error: isTimeout
                ? 'PDF server sedang dalam kondisi tidur (cold start). Coba lagi dalam 30 detik, atau gunakan opsi Cetak Browser.'
                : (error.message || 'Gagal terhubung ke PDF server.'),
            fallback: true
        });
    }
};
