#!/usr/bin/env node

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const extensionPath = join(packageRoot, "src", "index.ts");
const args = ["--extension", extensionPath, ...process.argv.slice(2)];

const child = spawn("pi", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    PI_CMUX_ENTRYPOINT: "1",
  },
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(`pi-cmux: could not start pi: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exitCode = code ?? 1;
});
