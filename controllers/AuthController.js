import { v4 as uuidv4 } from 'uuid';

const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redis = require('../utils/redis');

export async function getConnect(req, res) {
  const dbName = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
  let authTokens = Buffer.from(req.headers.authorization.split(' ')[1], 'base64');
  authTokens = authTokens.toString();
  const emailtoken = authTokens.split(':')[0];
  const passwdtoken = sha1(authTokens.split(':')[1]);
  const user = await dbClient.client.db(dbName).collection('users').findOne({ email: emailtoken, password: passwdtoken });

  if (!user) {
    res.status(401).send('{"error":"Unauthorized"}');
    return;
  }
  const idToken = uuidv4();
  const key = `auth_${idToken}`;
  await redis.set(key, idToken, 86400);
  await redis.set(idToken, emailtoken, 86400);
  res.status(200).send(`{ "token": ${idToken}}`);
}

export async function getDisconnect(req, res) {
  const authToken = req.headers['x-token'];
  const key = `auth_${authToken}`;
  const result = await redis.get(key);
  if (!result) {
    res.status(401).send('{"error":"Unauthorized"}');
    return;
  }

  await redis.del(key);
  res.status(204).send('');
}
