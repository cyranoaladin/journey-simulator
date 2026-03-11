/**
 * Index Routes - TypeScript
 */

import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: 'mf-back', status: 'running' });
});

export default router;
