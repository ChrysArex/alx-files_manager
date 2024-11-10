const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redis = require('../utils/redis');

export async function postNew(req, res) {
  const db = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
  if (!req.body.email) {
    res.status(400).send('{"error":"Missing email"}');
  }
  if (!req.body.password) {
    res.status(400).send('{"error":"Missing password"}');
  }
  let email = await dbClient.client.db(db).collection('users').findOne({ email: req.body.email });
  if (email) {
    res.status(400).send('{"error":"Already exist"}');
  }
  email = req.body.email;
  const passwd = sha1(req.body.password);
  const result = await dbClient.client.db(db).collection('users').insertOne({ email, password: passwd });
  res.status(201).send(`{"id": ${result.insertedId}, "email": ${email}}`);
}

export async function getMe(req, res) {
  const authToken = req.headers['x-token'];
  const key = `auth_${authToken}`;
  const result = await redis.get(key);
  if (!result) {
    res.status(401).send('{"error":"Unauthorized"}');
    return;
  }
  const db = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';

  const email = await redis.get(authToken);
  const user = await dbClient.client.db(db).collection('users').findOne({ email });
  console.log("here is what i'v found", authToken);
  res.send(`{"id":${user._id},"email":${email}}`);
}
