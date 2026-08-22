export const maxDuration = 60;

export default async function handler(req, res) {
  const path = req.query.path;
  if (!path || !/^[\w:.\/-]+\.json$/.test(path)) {
    res.status(400).json({ error: 'path invalido' });
    return;
  }

  const url = `https://froststream.cloutteam.com/${path}`;
  const maxAttempts = 2;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      const r = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timer);

      if (!r.ok) throw new Error(`upstream ${r.status}`);
      const data = await r.json();
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
      res.status(200).json(data);
      return;
    } catch (e) {
      if (i === maxAttempts - 1) {
        res.status(502).json({ error: 'FrostStream indisponivel', detail: String((e && e.message) || e) });
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
}
