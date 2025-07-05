export default function handler(req, res) {
  const { username, password } = req.body;
  const admin = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (username === admin && password === adminPass) {
    return res.status(200).json({ token: "admin-token", role: "admin" });
  }

  const reseller = process.env.RESELLER_USER;
  const resellerPass = process.env.RESELLER_PASS;

  if (username === reseller && password === resellerPass) {
    return res.status(200).json({ token: "reseller-token", role: "reseller" });
  }

  return res.status(401).json({ error: "Username atau password salah" });
}