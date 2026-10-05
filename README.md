# Nimbus — backend-connected cloud platform console

A working Node.js/Express backend for the Nimbus console: a real REST API,
a real file-persisted database, and optional live AWS S3 integration for
the storage module. Tested end-to-end before delivery (every create,
toggle, and delete route was exercised with curl).

## What's real here vs. the earlier browser-only version

| | Browser-only version | This version |
|---|---|---|
| Data lives in | localStorage (per browser) | `data.json` on the server (shared, survives restarts) |
| Multiple users | Each sees their own copy | Everyone hitting the server sees the same state |
| Storage module | Fully simulated | Creates **real S3 buckets** if you provide AWS credentials |
| Everything else (compute, database, networking, security, backups) | Simulated | Still simulated — a real version of these needs actual AWS resources (EC2, RDS, VPC, IAM), which cost money and need an AWS account tied to a real payment method |

## Project structure

```
nimbus-backend/
  server.js        entry point — wires up routes, serves the frontend
  db.js             lowdb (JSON-file) database with seed data
  aws.js            optional live S3 integration
  utils.js          id generation + activity logging
  routes/           one file per module (compute, storage, database, network, security, backup)
  public/index.html the frontend — same UI as before, now calling the API
  .env.example      copy to .env to enable real AWS calls
```

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000**. The server serves both the API and
the frontend, so that's the only URL you need.

## Enable real AWS S3 (optional)

1. Get an AWS access key with `s3:CreateBucket`, `s3:DeleteBucket`, and
   `s3:ListBuckets` permissions (an IAM user scoped to just S3 is safest
   — don't use root account keys).
2. `cp .env.example .env` and fill in `AWS_ACCESS_KEY_ID`,
   `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`.
3. Restart the server. The topbar will show "Live AWS: connected", and
   any bucket you create with type "Object (S3-style)" will be a real
   bucket in your AWS account, visible in the S3 console. Deleting it
   in Nimbus deletes the real bucket too.

Without a `.env` file, the app still runs completely — storage
resources are just recorded in the local database with a "simulated"
tag instead.

## API reference

| Method | Path | Does |
|---|---|---|
| GET | `/api/state` | Full platform state (used to render every view) |
| POST | `/api/compute` | Launch an instance |
| PATCH | `/api/compute/:id/toggle` | Start/stop an instance |
| DELETE | `/api/compute/:id` | Terminate an instance |
| POST | `/api/storage` | Create a bucket (real S3 if configured) |
| DELETE | `/api/storage/:id` | Delete a bucket |
| POST | `/api/database` | Create a database instance |
| DELETE | `/api/database/:id` | Delete a database instance |
| POST | `/api/network` | Create a VPC |
| DELETE | `/api/network/:id` | Delete a VPC |
| POST | `/api/security/users` | Add an IAM user |
| DELETE | `/api/security/users/:id` | Remove an IAM user |
| POST | `/api/backups` | Take a snapshot of a resource |
| DELETE | `/api/backups/:id` | Delete a snapshot |
| PATCH | `/api/backups/cross-region/toggle` | Toggle cross-region replication |

## Natural next steps, if you want to keep extending this

- Swap `lowdb` for Postgres/MongoDB when you need concurrent writes at scale
- Add login (e.g. JWT-based auth) so `/api/*` routes require a signed-in user
- Extend the same live-integration pattern to a second module — e.g. real
  EC2 instances via `@aws-sdk/client-ec2`, gated the same way `aws.js` gates S3
