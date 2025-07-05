export default function handler(req, res) {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    return res.status(200).json({ token: "admin-token", role: "admin" });
  }

  if (username === process.env.RESELLER_USER && password === process.env.RESELLER_PASS) {
    return res.status(200).json({ token: "reseller-token", role: "reseller" });
  }

  res.status(401).json({ error: "Username atau password salah" });
}