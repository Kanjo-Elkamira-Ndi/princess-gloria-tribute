/**
 * Load .env file into process.env (simple, no dependencies).
 */
import { readFileSync } from "fs";
import { resolve } from "path";

export function loadEnv() {
  const envPath = resolve(__dirname, "..", ".env");
  let content: string;
  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    return; // no .env file — rely on shell env
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
