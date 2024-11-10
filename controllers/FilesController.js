import { v4 as uuidv4 } from 'uuid';

const fs = require('fs');
const redis = require('../utils/redis');
const dbClient = require('../utils/db');

export async function postUpload(req, res) {
  const dbName = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
  const email = await redis.get(req.headers['x-token']);
  if (!email) {
    res.status(401).send('{"error":"Unauthorized"}');
    return;
  }
  const user = await dbClient.client.db(dbName).collection('users').findOne({ 'email': email });

  const { name } = req.body;
  const { type } = req.body;
  const { data } = req.body;
  const parentId = req.body.parentId ? req.body.parentId : 0;
  const isPublic = req.body.isPublic ? req.body.isPublic : false;
  const acceptedTypes = ['folder', 'file', 'image'];

  if (!name) {
    res.status(400).send('{"error": "Missing name"}');
    return;
  }
  if (!type || !acceptedTypes.includes(type)) {
    res.status(400).send('{"error": "Missing type"}');
    return;
  }

  if (!data && type !== 'folder') {
    res.status(400).send('{"error": "Missing data"}');
    return;
  }

  if (parentId) {
    const parentFolder = await dbClient.client.db(dbName).collection('files').findOne({ parentId });
    if (!parentFolder) {
      res.status(400).send('{"error": "Parent is not a folder"}');
      return;
    } if (parentFolder.type !== 'folder') {
      res.status(400).send('{"error": "Parent is not a folder"}');
      return;
    }
  }

  if (type === 'folder') {
    const doc = {
      userId: user._id, name, type, parentId, isPublic,
    };
    const insertedDoc = await dbClient.client.db(dbName).collection('files').insertOne(doc);
    res.status(201).send(`{"id": ${insertedDoc._id}, "userId": ${user._id}, "name": ${name}, "type": ${type}, "parentId": ${parentId}, "isPublic": ${isPublic}}`);
  } else {
    const folderPath = process.env.FOLDER_PATH ? process.env.FOLDER_PATH : '/tmp/files_manager';
    const localPath = `${folderPath}/${uuidv4()}`;
    let decodedData = Buffer.from(data, 'base64');
    decodedData = decodedData.toString();
    fs.mkdir('/tmp/files_manager', (err) => console.log(err));
    fs.writeFile(localPath, decodedData, () => console.log('data wrote'));
    const doc = {
      userId: user._id, name, type, parentId, isPublic, localPath,
    };
    const insertedDoc = await dbClient.client.db(dbName).collection('files').insertOne(doc);
    res.status(201).send(`{"id": ${insertedDoc.insertedid}, "userId": ${user._id}, "name": ${name}, "type": ${type}, "parentId": ${parentId}, "isPublic": ${isPublic}}, "localPath": ${localPath}`);
  }
}

export async function getShow(req, res) {
  const dbName = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
  const email = await redis.get(req.headers['x-token']);
  if (!email) {
    res.status(401).send('{"error":"Unauthorized"}');
    return;
  }
  const user = await dbClient.client.db(dbName).collection('users').findOne({ email });
  const reqestedFile = await dbClient.client.db(dbName).collection('files').findOne({ userId: user._id, id: req.params.id});
	if (!reqestedFile) {
		res.status(401).send('{"error":"Not found"}');
		return;
	}
	res.send(reqestedFile);
}

export async function getIndex(req, res) {
  const dbName = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
  const email = await redis.get(req.headers['x-token']);
  if (!email) {
    res.status(401).send('{"error":"Unauthorized"}');
    return;
  }
  const user = await dbClient.client.db(dbName).collection('users').findOne({ email });
}
