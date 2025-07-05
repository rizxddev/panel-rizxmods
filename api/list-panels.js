export default async function handler(req, res) {
  const apiUrl = process.env.PANEL_API_URL;
  const apiKey = process.env.PANEL_API_KEY;

  try {
    const resp = await fetch(`${apiUrl}/api/application/servers`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "Application/vnd.pterodactyl.v1+json"
      }
    });
    const data = await resp.json();
    const servers = data.data.map(s => ({
      uuid: s.attributes.uuid,
      name: s.attributes.name,
      user_id: s.attributes.user,
      limits: s.attributes.limits
    }));
    return res.status(200).json({ servers });
  } catch {
    return res.status(500).json({ error: "Gagal ambil data dari panel." });
  }
}