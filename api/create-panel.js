import fetch from 'node-fetch';

function generateRandomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, plan } = req.body;
  const API_KEY = process.env.API_KEY;
  const DOMAIN = process.env.DOMAIN;

  if (!API_KEY || !DOMAIN) {
    return res.status(500).json({ error: 'API_KEY atau DOMAIN belum dikonfigurasi' });
  }

  const randomPassword = generateRandomPassword();

  try {
    // ✅ Cek apakah username sudah digunakan
    const checkUserRes = await fetch(`${DOMAIN}/api/application/users?filter[name]=${username}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'Application/vnd.pterodactyl.v1+json'
      }
    });

    const checkData = await checkUserRes.json();
    const userExists = checkData.data && checkData.data.length > 0;

    if (userExists) {
      return res.status(409).json({ error: 'Username sudah digunakan. Silakan pilih username lain.' });
    }

    // 🧑 Buat user baru
    const userRes = await fetch(`${DOMAIN}/api/application/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'Application/vnd.pterodactyl.v1+json'
      },
      body: JSON.stringify({
        username,
        email: `${username}@gmail.com`,
        first_name: username,
        last_name: 'User',
        password: randomPassword
      })
    });

    const userData = await userRes.json();
    if (!userRes.ok && userData.errors) {
      return res.status(400).json({ error: userData.errors[0].detail });
    }

    const userId = userData.attributes ? userData.attributes.id : userData.id;

    // 📦 RAM Mapping (1–10 GB & Unlimited)
    const RAM_MAP = {
      '1gb-v2': 1024,
      '2gb-v2': 2048,
      '3gb-v2': 3072,
      '4gb-v2': 4096,
      '5gb-v2': 5120,
      '6gb-v2': 6144,
      '7gb-v2': 7168,
      '8gb-v2': 8192,
      '9gb-v2': 9216,
      '10gb-v2': 10240,
      'unlimited-v2': 999999
    };

    const ram = RAM_MAP[plan] || 1024;

    // 🚀 Buat server
    const serverRes = await fetch(`${DOMAIN}/api/application/servers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'Application/vnd.pterodactyl.v1+json'
      },
      body: JSON.stringify({
        name: `${username}-server`,
        user: userId,
        egg: 1,
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        startup: 'npm start',
        limits: {
          memory: ram,
          swap: 0,
          disk: 10240,
          io: 500,
          cpu: 0
        },
        environment: {
          AUTO_UPDATE: '0'
        },
        feature_limits: {
          databases: 1,
          allocations: 1,
          backups: 1
        },
        allocation: {
          default: 1
        }
      })
    });

    const serverData = await serverRes.json();
    if (!serverRes.ok) {
      return res.status(400).json({
        error: serverData.errors?.[0]?.detail || 'Gagal membuat server'
      });
    }

    return res.status(200).json({
      message: 'Panel berhasil dibuat!',
      user: {
        id: userId,
        username,
        email: `${username}@gmail.com`,
        password: randomPassword
      },
      server: serverData
    });

  } catch (err) {
    console.error('ERROR:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan saat membuat panel.' });
  }
}