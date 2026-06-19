module.exports = async (req, res) => {
    const serverUrl = process.env.PDF_SERVER_URL || 'TIDAK_DIKONFIGURASI';
    let targetStatus = 'unknown';
    let targetResponse = null;

    if (serverUrl !== 'TIDAK_DIKONFIGURASI') {
        try {
            const response = await fetch(`${serverUrl.replace(/\/$/, '')}/health`, { signal: AbortSignal.timeout(5000) });
            targetStatus = response.ok ? 'connected' : 'error_response';
            targetResponse = await response.json();
        } catch (e) {
            targetStatus = `failed: ${e.message}`;
        }
    }

    res.json({
        status: 'ok',
        environment: process.env.VERCEL ? 'vercel' : 'local',
        pdf_server_configured: serverUrl !== 'TIDAK_DIKONFIGURASI',
        pdf_server_url: serverUrl,
        pdf_server_connection: targetStatus,
        pdf_server_health: targetResponse
    });
};
