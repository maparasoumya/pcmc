import { spawnSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apps = { citizen: "citizen-portal", admin: "admin-panel" };
const app = apps[process.env.PCMC_APP];
if (!app) {
  console.error(
    "Set PCMC_APP=citizen or PCMC_APP=admin in this Vercel project.",
  );
  process.exit(1);
}
const result = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["--prefix", app, "run", "build"],
  { cwd: root, stdio: "inherit", env: process.env },
);
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status || 1);
const output = path.join(root, "dist");
rmSync(output, { recursive: true, force: true });
cpSync(path.join(root, app, "dist"), output, { recursive: true });
console.log(`Prepared ${app} for Vercel.`);
