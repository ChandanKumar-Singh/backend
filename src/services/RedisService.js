import { createClient } from 'redis';
import Constants from '../config/constants.js';
import { logg, warnLog } from '../utils/logger.js';


class RedisService {
    constructor() {
        logg(Constants)
        this.REDIS_KEY = Constants.Redis.KEY || '';
        this.ENABLED = Constants.Redis.Enabled || false;
        if (this.ENABLED) {
            this.client = createClient({
                url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            });
            this.client.on('connect', () => {
                console.log('✅ Connected to Redis');
            });
            this.client.on('error', (err) => console.error('❌ Redis Error:', err));
        } else {
            console.log('⚠️ Redis is disabled. Running without cache.');
        }
    }

    async start() {
        if (!this.ENABLED) return;
        try {
            await this.client.connect();
        } catch (err) {
            console.error('❌ Redis Start Error:', err);
        }
    }

    // ✅ Set a key-value pair inside a Redis hash
    async hset(hashKey, field, value, encode = true, expiry = 60 * 60) {
        if (!this.ENABLED) return null;
        try {
            logg('Setting redis field:', this.REDIS_KEY + hashKey, field?.toString(), value);
            let res = await this.client.hSet(this.REDIS_KEY + hashKey, field?.toString(), encode ? JSON.stringify(value) : value);
            if (expiry > 0) {
                await this.client.expire(this.REDIS_KEY + hashKey, expiry);
            }
            return res;
        } catch (err) {
            console.error('❌ Redis HSET Error:', err);
        }
    }

    // ✅ Get a single field from a Redis hash
    async hget(hashKey, field, decode = true) {
        if (!this.ENABLED) return null;
        try {
            // warnLog('Getting redis field:', this.REDIS_KEY + hashKey, field);
            let res = await this.client.hGet(this.REDIS_KEY + hashKey, field?.toString());
            return decode ? JSON.parse(res) : res;
        } catch (err) {
            console.error('❌ Redis HGET Error:', err);
        }
    }

    // ✅ Get all fields and values in a Redis hash
    async hgetall(hashKey) {
        if (!this.ENABLED) return null;
        try {
            // logg('Getting redis hash:', this.REDIS_KEY + hashKey);
            return await this.client.hGetAll(this.REDIS_KEY + hashKey);
        } catch (err) {
            console.error('❌ Redis HGETALL Error:', err);
        }
    }

    // ✅ Delete a field from a Redis hash
    async hdel(hashKey, field) {
        if (!this.ENABLED) return null;
        try {
            // logg('Deleting redis field:', this.REDIS_KEY + hashKey, field);
            return await this.client.hDel(this.REDIS_KEY + hashKey, field?.toString());
        } catch (err) {
            console.error('❌ Redis HDEL Error:', err);
        }
    }

    // ✅ Delete an entire hash key
    async del(hashKey) {
        if (!this.ENABLED) return;
        try {
            // logg('Deleting redis key:', this.REDIS_KEY + hashKey);
            return await this.client.del(this.REDIS_KEY + hashKey);
        } catch (err) {
            console.error('❌ Redis DEL Error:', err);
        }
    }

    async quit() {
        if (!this.ENABLED) return;
        try {
            await this.client.quit();
            console.log('✅ Redis Disconnected');
        } catch (err) {
            console.error('❌ Redis QUIT Error:', err);
        }
    }
}

export default new RedisService();
