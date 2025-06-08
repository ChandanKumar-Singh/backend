import { createClient } from 'redis';
import Constants from '../config/constants.js';
import { errorLog, greenLog } from '../utils/logger.js';
import { initSocket } from './sockets/index.js';

const createRedisClient = () => createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
const redisClient = createRedisClient();
const redisPublisher = createRedisClient();
const redisSubscriber = redisClient;
redisSubscriber.on('error', (err) => errorLog('❌ Redis Error:', err));
redisSubscriber.on('connect', () => greenLog('✅ Connected to Redis'));

class RedisServices {
    constructor() {
        this.REDIS_KEY = (Constants.Redis.KEY || '') + ':';
        this.ENABLED = Constants.Redis.Enabled || false;
        if (this.ENABLED) {
            this.client = redisClient;
        } else {
            console.log('🚮 Redis is disabled. Running without cache.');
        }
    }

    async start(server) {
        if (!this.ENABLED) return;
        try {
            await this.client.connect();
            await this.deleteAll();
            initSocket(server);
        } catch (err) {
            errorLog('❌ Redis Start Error:', err);
        }
    }

    // ✅ Set a key-value pair inside a Redis hash
    async hset(hashKey, field, value, encode = true, expiry = 60 * 60) {
        if (!this.ENABLED) return null;
        try {
            let data = encode ? JSON.stringify(value) : value;
            // infoLog('Setting redis field:', this.REDIS_KEY + hashKey, field?.toString(), data);
            let res = await this.client.hSet(this.REDIS_KEY + hashKey, field?.toString(), data);
            if (expiry > 0) {
                await this.client.expire(this.REDIS_KEY + hashKey, expiry);
            }
            return res;
        } catch (err) {
            errorLog('❌ Redis HSET Error:', err);
        }
    }

    // ✅ Get a single field from a Redis hash
    async hget(hashKey, field, decode = true) {
        if (!this.ENABLED) return null;
        try {
            // warnLog('Getting redis field:', this.REDIS_KEY + hashKey, field?.toString());
            let res = await this.client.hGet(this.REDIS_KEY + hashKey, field?.toString());
            return decode ? JSON.parse(res) : res;
        } catch (err) {
            errorLog('❌ Redis HGET Error:', err);
        }
    }

    // ✅ Get all fields and values in a Redis hash
    async hgetall(hashKey) {
        if (!this.ENABLED) return null;
        try {
            // logg('Getting redis hash:', this.REDIS_KEY + hashKey);
            return await this.client.hGetAll(this.REDIS_KEY + hashKey);
        } catch (err) {
            errorLog('❌ Redis HGETALL Error:', err);
        }
    }

    // ✅ Delete a field from a Redis hash
    async hdel(hashKey, field) {
        if (!this.ENABLED) return null;
        try {
            // logg('Deleting redis field:', this.REDIS_KEY + hashKey, field);
            return await this.client.hDel(this.REDIS_KEY + hashKey, field?.toString());
        } catch (err) {
            errorLog('❌ Redis HDEL Error:', err);
        }
    }

    // ✅ Delete an entire hash key
    async del(hashKey) {
        if (!this.ENABLED) return;
        try {
            // logg('Deleting redis key:', this.REDIS_KEY + hashKey);
            return await this.client.del(this.REDIS_KEY + hashKey);
        } catch (err) {
            errorLog('❌ Redis DEL Error:', err);
        }
    }

    async quit() {
        if (!this.ENABLED) return;
        try {
            await this.client.quit();
            console.log('✅ Redis Disconnected');
        } catch (err) {
            errorLog('❌ Redis QUIT Error:', err);
        }
    }

    async deleteAll() {
        if (!this.ENABLED) return;
        try {
            Object.keys(Constants.REDIS_KEYS).forEach(async (key) => {
                if ([
                    Constants.REDIS_KEYS.ADMIN_AUTH,
                    Constants.REDIS_KEYS.USER_AUTH,
                ].indexOf(Constants.REDIS_KEYS[key]) < 0) {
                    await this.del(Constants.REDIS_KEYS[key]);
                }
            }
            );
        } catch (err) {
            errorLog('❌ Redis DELETEALL Error:', err);
        }
    }
}
const Redis = new RedisServices();

export { redisSubscriber, redisPublisher, Redis };

// export default new RedisService();
