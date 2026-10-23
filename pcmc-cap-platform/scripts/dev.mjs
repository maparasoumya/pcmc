import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.resolve(root, "../CAP-BACKEND");
const python =
  process.env.PCMC_PYTHON ||
  path.join(
    backend,
    ".venv",
    process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
  );
if (!existsSync(python)) {
  console.error("Set up CAP-BACKEND/.venv first; see README.md.");
  process.exit(1);
}
const children = [
  spawn(python, ["manage.py", "runserver", "127.0.0.1:8000"], {
    cwd: backend,
    stdio: "inherit",
  }),
  ...["citizen-portal", "admin-panel"].map((app) =>
    spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"], {
      cwd: path.join(root, app),
      stdio: "inherit",
    }),
  ),
];
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
    stop();
  });
  child.on("exit", (code) => {
    if (!stopping) {
      process.exitCode = code || 0;
      stop();
    }
  });
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
