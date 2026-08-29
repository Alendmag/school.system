import { execSync } from "child_process";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname, "..");

// Build the client
console.log("Building client...");
execSync("npx vite build", { cwd: projectRoot, stdio: "inherit" });

// Build the server
console.log("Building server...");
execSync(
  `npx esbuild server/index.ts --bundle --platform=node --format=esm --outfile=dist/index.mjs --packages=external --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"`,
  { cwd: projectRoot, stdio: "inherit" }
);

console.log("Build complete.");
