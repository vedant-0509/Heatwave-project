import { model, Schema } from 'mongoose';

const wardSchema = new Schema({
  ward_id: { type: String, required: true, unique: true, index: true },
  data: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const Ward = model('Ward', wardSchema);
