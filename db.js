// db.js — a real, file-persisted JSON database (lowdb).
// Every module's state lives in data.json on disk, so it survives restarts
// and is shared across every browser/client that hits this server —
// unlike the earlier version's per-browser localStorage.

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, 'data.json'));
const db = low(adapter);

db.defaults({
  compute: [
    { id: 'i-7a2f19', name: 'web-front-1', itype: 't3.medium', az: 'ap-south-1a', status: 'running' },
    { id: 'i-3c88de', name: 'worker-batch-1', itype: 't3.large', az: 'ap-south-1b', status: 'stopped' }
  ],
  storage: [
    { id: 'bkt-user-assets', name: 'user-assets', kind: 'Object (S3-style)', sizeGB: 128, region: 'ap-south-1', live: false }
  ],
  database: [
    { id: 'db-primary-01', name: 'primary', engine: 'PostgreSQL', multiAZ: true, status: 'available' }
  ],
  network: [
    { id: 'vpc-9f21', name: 'platform-vpc', cidr: '10.20.0.0/16', subnets: 4 }
  ],
  users: [
    { id: 'usr-admin', name: 'platform-admin', role: 'Administrator' }
  ],
  groups: [
    { id: 'sg-web', name: 'web-tier', rule: 'Allow 443 from 0.0.0.0/0' }
  ],
  backups: [],
  crossRegion: true,
  log: []
}).write();

module.exports = db;
