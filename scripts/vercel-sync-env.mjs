#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

function usage() {
  console.log(
    "Usage: node scripts/vercel-sync-env.mjs --env <preview|production|development> --file <path-to-env-file> [--yes]",
  );
}

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const targetEnv = getArg("--env");
const file = getArg("--file");
const autoYes = args.includes("--yes");

if (!targetEnv || !file) {
  usage();
  process.exit(1);
}

const envFilePath = path.resolve(process.cwd(), file);
if (!fs.existsSync(envFilePath)) {
  console.error(`Env file not found: ${envFilePath}`);
  process.exit(1);
}

const content = fs.readFileSync(envFilePath, "utf8");
const lines = content.split(/\r?\n/);

const pairs = [];
for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 0) continue;

  const key = line.slice(0, eq).trim();
  let value = line.slice(eq + 1).trim();

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  if (!key) continue;
  pairs.push({ key, value });
}

if (!pairs.length) {
  console.log("No key/value pairs found in file.");
  process.exit(0);
}

console.log(`Preparing to sync ${pairs.length} vars to Vercel environment: ${targetEnv}`);
for (const { key } of pairs) console.log(` - ${key}`);

if (!autoYes) {
  console.log("\nRe-run with --yes to apply changes.");
  process.exit(0);
}

for (const { key, value } of pairs) {
  spawnSync("vercel", ["env", "rm", key, targetEnv, "--yes"], {
    stdio: "ignore",
    cwd: process.cwd(),
  });

  const add = spawnSync("vercel", ["env", "add", key, targetEnv], {
    input: `${value}\n`,
    encoding: "utf8",
    cwd: process.cwd(),
  });

  if (add.status !== 0) {
    console.error(`Failed setting ${key} on ${targetEnv}`);
    process.stderr.write(add.stderr || "");
    process.exit(add.status ?? 1);
  }

  console.log(`✓ ${key}`);
}

console.log("\nSync complete.");
