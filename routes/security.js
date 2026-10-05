const express = require('express');
const db = require('../db');
const { genId, logEvent } = require('../utils');

const router = express.Router();

router.post('/users', (req, res) => {
  const { name = 'user', role = 'Read-only' } = req.body;
  const user = { id: genId('usr'), name, role };
  db.get('users').push(user).write();
  logEvent(`Added IAM user "${name}" with role ${role}`);
  res.status(201).json(user);
});

router.delete('/users/:id', (req, res) => {
  db.get('users').remove({ id: req.params.id }).write();
  logEvent(`Removed IAM user ${req.params.id}`);
  res.status(204).end();
});

module.exports = router;
