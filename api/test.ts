export default function handler(req: any, res: any) {
  res.json({ test: 'ok', nodeVersion: process.version, env: !!process.env.VERCEL });
}
