import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST ? process.env.DB_HOST : 'localhost';
    this.port = process.env.DB_PORT ? process.env.DB_PORT : '27017';
    this.database = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
    const uri = `mongodb://${this.host}:${this.port}`;

    this.client = new MongoClient(uri, { useUnifiedTopology: true });

    this.isConnected = false;
    this.client.connect().then(() => {
      this.isConnected = true;
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    const users = await this.client.db(`${this.database}`).collection('user').countDocuments();
    return users;
  }

  async nbFiles() {
    const files = await this.client.db(`${this.database}`).collection('files').countDocuments();
    return files;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
