const express = require('express');
const db = require('../db');
const { genId, logEvent } = require('../utils');

const router = express.Router();

router.post('/', (req, res) => {
  const { name = 'instance', itype = 't3.micro', az = 'ap-south-1a' } = req.body;
  const instance = { id: genId('i'), name, itype, az, status: 'running' };
  db.get('compute').push(instance).write();
  logEvent(`Launched instance "${name}" (${itype}) in ${az}`);
  res.status(201).json(instance);
});

router.patch('/:id/toggle', (req, res) => {
  const instance = db.get('compute').find({ id: req.params.id }).value();
  if (!instance) return res.status(404).json({ error: 'Instance not found' });
  const next = instance.status === 'running' ? 'stopped' : 'running';
  db.get('compute').find({ id: req.params.id }).assign({ status: next }).write();
  logEvent(`Instance ${req.params.id} set to ${next}`);
  res.json({ id: req.params.id, status: next });
});

router.delete('/:id', (req, res) => {
  db.get('compute').remove({ id: req.params.id }).write();
  logEvent(`Terminated instance ${req.params.id}`);
  res.status(204).end();
});

module.exports = router;
