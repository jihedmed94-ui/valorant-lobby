import crypto from 'node:crypto';
import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { dataStore } from '../models/dataStore.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(dataStore.tournaments);
});

router.post('/', requireAdmin, (req, res) => {
  const tournament = { id: crypto.randomUUID(), createdAt: Date.now(), ...req.body };
  dataStore.tournaments.unshift(tournament);
  res.status(201).json(tournament);
});

export default router;
