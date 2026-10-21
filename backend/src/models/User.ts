import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'analyst'], default: 'analyst' },
  savedWards: { type: [String], default: [] }
}, { timestamps: true });

export const User = model('User', userSchema);
