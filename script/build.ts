import { execSync } from "child_process";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname, "..");

console.log("Building client...");
execSync("npx vite build", { cwd: projectRoot, stdio: "inherit" });

console.log("Building server...");
execSync(
  `npx esbuild server/index.ts --bundle --platform=node --format=esm --outfile=dist/index.mjs --packages=external`,
  { cwd: projectRoot, stdio: "inherit" }
);

console.log("Build complete.");
