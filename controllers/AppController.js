const redis = require('../utils/redis');
const db = require('../utils/db');

export function getStatus(req, res) {
  if (redis.isAlive() && db.isAlive()) {
    res.status(200).send('{ "redis": true, "db": true }');
  }
}

export async function getStats(req, res) {
  const nbUsers = await db.nbUsers();
  const nbFiles = await db.nbFiles();
  const stats = `{ "users": ${nbUsers}, "files": ${nbFiles} }`;
  res.status(200).send(stats);
}
