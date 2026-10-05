const express = require('express');
const db = require('../db');
const { genId, logEvent } = require('../utils');

const router = express.Router();

router.post('/', (req, res) => {
  const { name = 'database', engine = 'PostgreSQL', multiAZ = false } = req.body;
  const instance = { id: genId('db'), name, engine, multiAZ: Boolean(multiAZ), status: 'available' };
  db.get('database').push(instance).write();
  logEvent(`Created ${engine} database "${name}"${instance.multiAZ ? ' (multi-AZ)' : ''}`);
  res.status(201).json(instance);
});

router.delete('/:id', (req, res) => {
  db.get('database').remove({ id: req.params.id }).write();
  logEvent(`Deleted database ${req.params.id}`);
  res.status(204).end();
});

module.exports = router;
