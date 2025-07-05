import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const filePath = path.join(process.cwd(), "data", "resellers.json");

function read() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

function write(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ resellers: read() });
  }

  if (req.method === "POST") {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username & password wajib." });
    const all = read();
    if (all.find(r => r.username === username)) return res.status(409).json({ error: "Sudah ada." });
    const hash = bcrypt.hashSync(password, 10);
    all.push({ username, password: hash });
    write(all);
    return res.status(200).json({ message: "Reseller ditambahkan." });
  }

  if (req.method === "DELETE") {
    const { username } = req.body;
    const all = read();
    const filtered = all.filter(r => r.username !== username);
    if (filtered.length === all.length) return res.status(404).json({ error: "Tidak ditemukan" });
    write(filtered);
    return res.status(200).json({ message: "Reseller dihapus" });
  }

  if (req.method === "PUT") {
    const { username, password } = req.body;
    const all = read();
    const idx = all.findIndex(r => r.username === username);
    if (idx === -1) return res.status(404).json({ error: "Tidak ditemukan" });
    all[idx].password = bcrypt.hashSync(password, 10);
    write(all);
    return res.status(200).json({ message: "Password diperbarui" });
  }

  return res.status(405).json({ error: "Method tidak didukung" });
}