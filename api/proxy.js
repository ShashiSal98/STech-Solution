export default async function handler(req, res) {
  const { target } = req.query;

  if (!target) {
    return res.status(400).json({ error: 'Missing target' });
  }

  try {
    const requestedUrl = Array.isArray(target) ? target[0] : target;
    const fetchUrl = new URL(requestedUrl);
    const upstream = await fetch(fetchUrl.toString(), {
      headers: {
        'user-agent': 'STechSolution-Proxy/1.0'
      }
    });

    const contentType = upstream.headers.get('content-type') || 'text/html';
    const body = await upstream.arrayBuffer();

    res.setHeader('content-type', contentType);
    res.setHeader('cache-control', 'no-store');

    if (contentType.includes('text/html')) {
      let html = Buffer.from(body).toString('utf-8');
      const baseUrl = fetchUrl.origin;
      html = html.replace(/<head>/i, `<head><base href="${baseUrl}/">`);
      return res.status(upstream.status).send(html);
    }

    return res.status(upstream.status).send(Buffer.from(body));
  } catch (error) {
    return res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
