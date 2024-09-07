const redis = require('../utils/redis.js');
const db = require('../utils/db.js');


export function getStatus(req, res) {
	if (redis.isAlive() && db.isAlive()) {
		res.status(200).send('{ "redis": true, "db": true }');
	}
}

export function getStats(req, res) {
	const stats = `{ "users": ${db.nbUsers}, "files": ${db.nbFiles} }`;
	res.status(200).send(stats);
}
