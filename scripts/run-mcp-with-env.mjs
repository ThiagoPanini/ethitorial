#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";

const separator = process.argv.indexOf("--");

if (separator < 3 || separator === process.argv.length - 1) {
  console.error(
    "Usage: node scripts/run-mcp-with-env.mjs <ENV_VAR>... -- <command> [args...]",
  );
  process.exit(2);
}

const allowedVariables = process.argv.slice(2, separator);
const [command, ...args] = process.argv.slice(separator + 1);

let repoRoot;
try {
  repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trim();
} catch {
  console.error("Unable to locate the repository root for the MCP environment.");
  process.exit(1);
}

const envFile = process.env.MCP_ENV_FILE || join(repoRoot, ".env");
let parsedEnv;

try {
  parsedEnv = parseEnv(readFileSync(envFile, "utf8"));
} catch {
  console.error(`Unable to read or parse MCP environment file: ${envFile}`);
  process.exit(1);
}

// Remove every .env key inherited from the parent, then pass only the allowlist.
const childEnv = { ...process.env };
for (const name of Object.keys(parsedEnv)) {
  delete childEnv[name];
}

for (const name of allowedVariables) {
  if (!parsedEnv[name]) {
    console.error(`Required MCP environment variable is missing or empty: ${name}`);
    process.exit(1);
  }
  childEnv[name] = parsedEnv[name];
}

// Keep dotenv-aware MCP packages away from the repository's complete .env file.
const runtimeDirectory =
  process.env.MCP_SERVER_CWD || join(repoRoot, ".local", "mcp-runtime");
mkdirSync(runtimeDirectory, { recursive: true });

const child = spawn(command, args, {
  cwd: runtimeDirectory,
  env: childEnv,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(`Unable to start MCP server command: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
