const express = require('express');
const db = require('../db');
const { genId, logEvent } = require('../utils');

const router = express.Router();

router.post('/', (req, res) => {
  const { sourceId, sourceLabel = 'resource' } = req.body;
  const crossRegion = db.get('crossRegion').value();
  const snapshot = {
    id: genId('snap'),
    sourceId,
    sourceLabel,
    createdAt: new Date().toLocaleString(),
    crossRegion
  };
  db.get('backups').unshift(snapshot).write();
  logEvent(`Took snapshot of ${sourceLabel}`);
  res.status(201).json(snapshot);
});

router.delete('/:id', (req, res) => {
  db.get('backups').remove({ id: req.params.id }).write();
  logEvent(`Deleted snapshot ${req.params.id}`);
  res.status(204).end();
});

router.patch('/cross-region/toggle', (req, res) => {
  const next = !db.get('crossRegion').value();
  db.set('crossRegion', next).write();
  logEvent(`Cross-region replication ${next ? 'enabled' : 'disabled'}`);
  res.json({ crossRegion: next });
});

module.exports = router;
