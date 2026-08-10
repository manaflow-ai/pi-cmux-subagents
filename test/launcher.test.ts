import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

test("pi-cmux explicitly loads the extension and forwards arguments", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pi-cmux-test-"));
  const capturePath = join(directory, "capture.json");
  const fakePi = join(directory, "pi");
  await writeFile(fakePi, `#!/usr/bin/env node
import { writeFileSync } from "node:fs";
writeFileSync(process.env.CAPTURE_PATH, JSON.stringify({
  argv: process.argv.slice(2),
  marker: process.env.PI_CMUX_ENTRYPOINT
}));
`, "utf8");
  await chmod(fakePi, 0o755);

  const launcher = resolve("bin/pi-cmux.mjs");
  const child = spawn(process.execPath, [launcher, "--model", "example/model", "hello"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PATH: `${directory}${delimiter}${process.env.PATH ?? ""}`,
      CAPTURE_PATH: capturePath,
    },
  });
  const code = await new Promise<number | null>((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", resolveExit);
  });
  assert.equal(code, 0);

  const captured = JSON.parse(await readFile(capturePath, "utf8")) as {
    argv: string[];
    marker: string;
  };
  assert.equal(captured.marker, "1");
  assert.equal(captured.argv[0], "--extension");
  assert.match(captured.argv[1], /src\/index\.ts$/);
  assert.deepEqual(captured.argv.slice(2), ["--model", "example/model", "hello"]);
});

test("package has a pi-cmux binary and no Pi autoload manifest", async () => {
  const manifest = JSON.parse(await readFile("package.json", "utf8")) as {
    bin?: Record<string, string>;
    pi?: unknown;
  };
  assert.deepEqual(manifest.bin, { "pi-cmux": "./bin/pi-cmux.mjs" });
  assert.equal(manifest.pi, undefined);
});
