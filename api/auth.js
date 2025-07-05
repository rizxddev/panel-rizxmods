import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // === DEBUG LOG START ===
  console.log("=== ENV DEBUG ===");
  console.log("ADMIN_USER:", JSON.stringify(process.env.ADMIN_USER));
  console.log("ADMIN_PASS:", JSON.stringify(process.env.ADMIN_PASS));
  console.log("=== END ENV DEBUG ===");
  // === DEBUG LOG END ===

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  // === DEBUG LOG INPUT ===
  console.log("INPUT username:", JSON.stringify(username));
  console.log("INPUT password:", JSON.stringify(password));
  // === END LOG INPUT ===

  // ✅ Login Admin dari .env
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return res.status(200).json({ token: "admin-token", role: "admin" });
  }

  // ✅ Login Reseller dari file JSON
  try {
    const filePath = path.resolve('./data/resellers.json');
    const rawData = fs.readFileSync(filePath);
    const resellers = JSON.parse(rawData);

    const reseller = resellers.find(
      (r) => r.username === username && r.password === password
    );
    if (reseller) {
      return res.status(200).json({ token: "reseller-token", role: "reseller" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to read reseller data" });
  }

  // ❌ Jika admin & reseller gagal
  return res.status(401).json({ error: "Username atau password salah" });
}
