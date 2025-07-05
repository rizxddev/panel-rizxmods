function generateRandomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default async function handler(req, res) {
  const { username, email, serverName, ram, cpu } = req.body;

  const api = process.env.PANEL_API_URL;
  const key = process.env.PANEL_API_KEY;

  if (!api || !key) {
    return res.status(500).json({ error: "API_KEY atau URL belum dikonfigurasi." });
  }

  // 🔐 Generate password untuk server
  const password = generateRandomPassword();

  // 🧠 Konfigurasi Payload Server
  const payload = {
    name: serverName,
    user: 1, // bisa disesuaikan jika dynamic
    egg: 15, // ⚠️ pastikan ini ID egg yang benar
    docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18",
    startup: "{{COMMAND}}", // gunakan variable sesuai format Egg
    limits: {
      memory: ram,
      swap: 0,
      disk: 10240,
      io: 500,
      cpu: cpu
    },
    environment: {
      USERNAME: username,
      EMAIL: email,
      PASSWORD: password,
      COMMAND: "npm start",     // ✅ wajib jika Egg pakai {{COMMAND}}
      STARTUP: "npm start"      // ✅ jika Egg juga butuh STARTUP var
    },
    feature_limits: {
      databases: 1,
      allocations: 1,
      backups: 1
    },
    deploy: {
      locations: [1], // pastikan location ID tersedia
      dedicated_ip: false,
      port_range: []
    },
    start_on_completion: true
  };

  try {
    const resp = await fetch(`${api}/api/application/servers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (resp.ok) {
      // ✅ Kirim juga password ke frontend
      return res.status(200).json({ ...data, password });
    }

    // ⛔ Error dari Pterodactyl
    res.status(400).json({ error: data.errors?.[0]?.detail || "Gagal membuat panel." });
  } catch {
    // ⛔ Koneksi ke panel gagal
    res.status(500).json({ error: "Koneksi ke panel gagal." });
  }
}
