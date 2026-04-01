import crypto from 'node:crypto';
import { Router } from 'express';
import { dataStore } from '../models/dataStore.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(dataStore.lobbies);
});

router.post('/', (req, res) => {
  const lobby = { id: crypto.randomUUID(), createdAt: Date.now(), ...req.body };
  dataStore.lobbies.unshift(lobby);
  res.status(201).json(lobby);
});

export default router;
