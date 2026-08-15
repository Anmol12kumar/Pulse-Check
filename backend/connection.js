const mongoose = require('mongoose');
require('dotenv').config();

const DEFAULT_LOCAL_URL = 'mongodb://127.0.0.1:27017/pulse-check';

function resolveMongoUrl(rawUrl = process.env.MONGO_URL) {
    const value = rawUrl ? String(rawUrl).trim() : '';
    if (!value) {
        console.warn(`MONGO_URL missing. Falling back to local MongoDB at ${DEFAULT_LOCAL_URL}`);
        return DEFAULT_LOCAL_URL;
    }

    if (value.startsWith('mongodb://') || value.startsWith('mongodb+srv://')) {
        return value;
    }

    console.warn(`MONGO_URL is invalid: "${value}". Falling back to local MongoDB at ${DEFAULT_LOCAL_URL}`);
    return DEFAULT_LOCAL_URL;
}

async function connectMongo() {
    const preferredUrl = resolveMongoUrl();
    const fallbackUrl = DEFAULT_LOCAL_URL;

    try {
        await mongoose.connect(preferredUrl, {
            serverSelectionTimeoutMS: 10000,
            retryWrites: true,
        });
        console.log(`Connected to MongoDB: ${preferredUrl}`);
        return mongoose.connection;
    } catch (err) {
        console.error('MongoDB connection error:', err.message || err);

        if (preferredUrl !== fallbackUrl) {
            console.warn(`Retrying MongoDB connection with local fallback: ${fallbackUrl}`);
            try {
                await mongoose.connect(fallbackUrl, {
                    serverSelectionTimeoutMS: 10000,
                    retryWrites: true,
                });
                console.log(`Connected to MongoDB fallback: ${fallbackUrl}`);
                return mongoose.connection;
            } catch (fallbackErr) {
                console.error('MongoDB fallback connection error:', fallbackErr.message || fallbackErr);
                throw fallbackErr;
            }
        }

        throw err;
    }
}

mongoose.set('strictQuery', true);

module.exports = {
    mongoose,
    DEFAULT_LOCAL_URL,
    resolveMongoUrl,
    connectMongo,
};