import crypto from 'node:crypto';
import { Router } from 'express';
import { dataStore } from '../models/dataStore.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(dataStore.teams);
});

router.post('/', (req, res) => {
  const team = { id: crypto.randomUUID(), createdAt: Date.now(), ...req.body };
  dataStore.teams.unshift(team);
  res.status(201).json(team);
});

export default router;
