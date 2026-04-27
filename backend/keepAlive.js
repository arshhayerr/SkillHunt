/*
 * Keep-alive: prevent Render's free-tier 15-minute idle shutdown.
 *
 * Strategy
 * --------
 * As long as the server is awake, fire a GET /api/health against our own
 * public URL every 10 minutes. The request counts as activity and resets
 * Render's idle timer, so the service never goes to sleep in the first
 * place.
 *
 * Notes
 * -----
 *  - Only runs in production (NODE_ENV === 'production') to avoid spamming
 *    requests during local dev.
 *  - Render automatically injects RENDER_EXTERNAL_URL at runtime. Fallback
 *    to a manually-set SELF_URL if ever deploying elsewhere.
 *  - Failures are logged but never thrown — a single failed ping shouldn't
 *    kill the whole process.
 *  - We use built-in `fetch` (Node 18+) to avoid a new dependency.
 */

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes — well under Render's 15m

const startKeepAlive = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('💤 Keep-alive disabled (NODE_ENV !== production)');
    return;
  }

  const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL;
  if (!baseUrl) {
    console.warn(
      '⚠️  Keep-alive: no RENDER_EXTERNAL_URL / SELF_URL set — skipping.'
    );
    return;
  }

  const url = `${baseUrl.replace(/\/+$/, '')}/api/health`;

  const ping = async () => {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        console.log(`🫀 Keep-alive ping OK (${new Date().toISOString()})`);
      } else {
        console.warn(`⚠️  Keep-alive ping non-200: ${res.status}`);
      }
    } catch (err) {
      console.warn(`⚠️  Keep-alive ping failed: ${err.message}`);
    }
  };

  // Slight initial delay so we don't hammer the server before it's fully
  // listening on the port.
  setTimeout(ping, 30_000);
  setInterval(ping, PING_INTERVAL_MS);

  console.log(`🫀 Keep-alive enabled → pinging ${url} every 10 minutes`);
};

module.exports = startKeepAlive;
