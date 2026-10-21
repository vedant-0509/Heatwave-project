import mongoose from 'mongoose';
import { env } from './config.js';
export async function connectDatabase() {
    if (env.USE_MONGODB === 'true' && mongoose.connection.readyState !== 1) {
        await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 });
    }
}
export function databaseReady() {
    return env.USE_MONGODB !== 'true' || mongoose.connection.readyState === 1;
}
