import fs from 'node:fs/promises';
import mongoose, { Schema } from 'mongoose';
import { env, metricsPath } from '../config.js';
const wardSchema = new Schema({ ward_id: { type: String, unique: true, required: true }, data: { type: Schema.Types.Mixed, required: true } }, { timestamps: true });
const Ward = mongoose.model('Ward', wardSchema);
const source = JSON.parse(await fs.readFile(metricsPath, 'utf8'));
const requiredNumericFields = ['hvi_score', 'lst_mean_celsius', 'ndvi_mean', 'ndbi_mean', 'population_density', 'cluster_id'];
const validRecords = Object.entries(source).filter(([wardId, data]) => {
    if (data.ward_id !== wardId || typeof data.ward_code !== 'string' || typeof data.ward_name !== 'string')
        return false;
    return requiredNumericFields.every((field) => typeof data[field] === 'number' && Number.isFinite(data[field]));
});
const skipped = Object.keys(source).length - validRecords.length;
if (skipped > 0) {
    throw new Error(`Refusing to seed ${skipped} invalid ward record(s). Stable IDs and required numeric fields are mandatory.`);
}
await mongoose.connect(env.MONGODB_URI);
let inserted = 0;
let updated = 0;
let unchanged = 0;
for (const [wardId, data] of validRecords) {
    const result = await Ward.updateOne({ ward_id: wardId }, { $set: { ward_id: wardId, data } }, { upsert: true });
    if (result.upsertedCount)
        inserted += 1;
    else if (result.modifiedCount)
        updated += 1;
    else
        unchanged += 1;
}
console.log(JSON.stringify({ inserted, updated, unchanged, skipped, source_records: Object.keys(source).length, seeded_records: validRecords.length }));
await mongoose.disconnect();
