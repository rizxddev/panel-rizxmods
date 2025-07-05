export default function handler(req, res) {
  res.status(200).json({
    ADMIN_USER: process.env.ADMIN_USER,
    ADMIN_PASS: process.env.ADMIN_PASS,
  });
}
