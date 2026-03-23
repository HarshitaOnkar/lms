import express from "express";

import { attachApi } from "./attachApi";

export function createApp() {
  const app = express();
  const env = attachApi(app, { mode: "standalone" });
  return { app, env };
}
