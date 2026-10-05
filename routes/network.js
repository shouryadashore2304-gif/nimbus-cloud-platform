const express = require('express');
const db = require('../db');
const { genId, logEvent } = require('../utils');

const router = express.Router();

router.post('/', (req, res) => {
  const { name = 'vpc', cidr = '10.0.0.0/16', subnets = 2 } = req.body;
  const vpc = { id: genId('vpc'), name, cidr, subnets: Number(subnets) || 2 };
  db.get('network').push(vpc).write();
  logEvent(`Created VPC "${name}" (${cidr}, ${vpc.subnets} subnets)`);
  res.status(201).json(vpc);
});

router.delete('/:id', (req, res) => {
  db.get('network').remove({ id: req.params.id }).write();
  logEvent(`Deleted VPC ${req.params.id}`);
  res.status(204).end();
});

module.exports = router;
