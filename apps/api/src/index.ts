import path from "path";
import dotenv from "dotenv";

import { createApp } from "./app";

// Load env from apps/api/.env (create it locally; see README / .env.example)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { app, env } = createApp();

const port = env.PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`);
});

