// aws.js — the one module in this project that can talk to real AWS.
// If credentials are present in the environment, storage-module "buckets"
// become real S3 buckets. If not, every route below degrades gracefully
// and the caller falls back to a simulated (database-only) resource.

const { S3Client, CreateBucketCommand, DeleteBucketCommand, ListBucketsCommand } =
  require('@aws-sdk/client-s3');

function s3Enabled() {
  return Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function client() {
  return new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
}

// S3 bucket names must be globally unique, lowercase, no underscores/spaces.
function sanitizeBucketName(name) {
  return (
    'nimbus-' +
    name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' + Math.random().toString(16).slice(2, 6) // keep it globally unique
  );
}

async function createRealBucket(name) {
  if (!s3Enabled()) return { live: false, bucketName: null, error: null };
  const bucketName = sanitizeBucketName(name);
  try {
    await client().send(new CreateBucketCommand({ Bucket: bucketName }));
    return { live: true, bucketName, error: null };
  } catch (err) {
    return { live: false, bucketName: null, error: err.message };
  }
}

async function deleteRealBucket(bucketName) {
  if (!s3Enabled() || !bucketName) return { ok: false, error: null };
  try {
    await client().send(new DeleteBucketCommand({ Bucket: bucketName }));
    return { ok: true, error: null };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function listRealBuckets() {
  if (!s3Enabled()) return { ok: false, buckets: [], error: 'AWS credentials not configured' };
  try {
    const res = await client().send(new ListBucketsCommand({}));
    return { ok: true, buckets: (res.Buckets || []).map(b => b.Name), error: null };
  } catch (err) {
    return { ok: false, buckets: [], error: err.message };
  }
}

module.exports = { s3Enabled, createRealBucket, deleteRealBucket, listRealBuckets };
