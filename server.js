require('dotenv').config();
const express = require('express');
const path = require('path');

const db = require('./db');
const { s3Enabled } = require('./aws');

const computeRoutes = require('./routes/compute');
const storageRoutes = require('./routes/storage');
const databaseRoutes = require('./routes/database');
const networkRoutes = require('./routes/network');
const securityRoutes = require('./routes/security');
const backupRoutes = require('./routes/backup');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Full platform state in one call — the dashboard and every module view
// read from this on load, then re-fetch it after each mutation.
app.get('/api/state', (req, res) => {
  res.json({ ...db.getState(), awsLive: s3Enabled() });
});

app.use('/api/compute', computeRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/backups', backupRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Nimbus backend running at http://localhost:${PORT}`);
  console.log(`Live AWS S3 integration: ${s3Enabled() ? 'ENABLED' : 'disabled (simulated storage only)'}`);
});
