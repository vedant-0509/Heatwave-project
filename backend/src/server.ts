import { app } from './app.js';
import { env } from './config.js';
import { connectDatabase } from './database.js';

connectDatabase()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`UrbanHeat Node API listening on http://localhost:${env.PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error('MongoDB connection failed:', error);
    process.exitCode = 1;
  });
