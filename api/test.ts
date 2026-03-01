export default async function handler(req: any, res: any) {
  try {
    // Step 1: Test top-level import of server
    const { default: app } = await import('../server/index.js');
    res.json({ ok: true, type: typeof app });
  } catch (e: any) {
    res.status(500).json({
      error: e.message,
      stack: e.stack?.split('\n').slice(0, 10),
    });
  }
}
