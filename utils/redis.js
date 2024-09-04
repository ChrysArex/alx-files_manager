import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
	constructor() {
		this.client = createClient();
		this.client.on('error', (err) => console.log(err.message));
		this.setAsync = promisify(this.client.set).bind(this.client);
		this.getAsync = promisify(this.client.get).bind(this.client);
		this.delAsync = promisify(this.client.del).bind(this.client);
	}

	isAlive() {
		try {
			this.client.ping();
			return true;
		} catch {
			return false;
		}
	}

	async get(key) {
		const value = await this.getAsync(key);
		return value;
	}

	async set(key, value, duration) {
		await this.setAsync(key, value, 'EX', duration);
	}

	async del(key) {
		await this.delAsync(key);
	}
}

const redisClient = new RedisClient();

module.exports = redisClient;
