const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const requestSchema = new Schema({
    method: { 
    type: String, 
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    required: true 
    },
    url: { type: String, required: true },
    body: { type: Schema.Types.Mixed }, // flexible payload
    headers: { type: Map, of: String }, // dynamic headers
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true });

requestSchema.index({ user: 1, url: 1 });// optimize queries by user and url

module.exports = model('Request', requestSchema);