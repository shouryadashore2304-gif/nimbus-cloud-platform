const express = require('express');
const db = require('../db');
const { genId, logEvent } = require('../utils');
const { s3Enabled, createRealBucket, deleteRealBucket, listRealBuckets } = require('../aws');

const router = express.Router();

// Lets the frontend show whether this server is actually wired up to AWS.
router.get('/aws-status', (req, res) => {
  res.json({ enabled: s3Enabled() });
});

router.get('/aws-live-buckets', async (req, res) => {
  const result = await listRealBuckets();
  res.json(result);
});

router.post('/', async (req, res) => {
  const { name = 'bucket', kind = 'Object (S3-style)', sizeGB = 10 } = req.body;
  let live = false, bucketName = null, note = null;

  if (kind === 'Object (S3-style)') {
    const result = await createRealBucket(name);
    live = result.live;
    bucketName = result.bucketName;
    if (result.error) note = result.error;
  }

  const resource = {
    id: genId('bkt'),
    name,
    kind,
    sizeGB: Number(sizeGB) || 10,
    region: process.env.AWS_REGION || 'ap-south-1',
    live,
    bucketName,
    note
  };
  db.get('storage').push(resource).write();
  logEvent(
    live
      ? `Created REAL S3 bucket "${bucketName}" for "${name}"`
      : `Created simulated ${kind.toLowerCase()} "${name}" (${resource.sizeGB} GB)`
  );
  res.status(201).json(resource);
});

router.delete('/:id', async (req, res) => {
  const resource = db.get('storage').find({ id: req.params.id }).value();
  if (resource && resource.live && resource.bucketName) {
    await deleteRealBucket(resource.bucketName);
  }
  db.get('storage').remove({ id: req.params.id }).write();
  logEvent(`Deleted storage resource ${req.params.id}`);
  res.status(204).end();
});

module.exports = router;
