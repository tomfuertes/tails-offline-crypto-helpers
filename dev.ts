// runner.ts
import { $ } from "bun";
import { watch } from "fs";

// import * as html from "./src/verify.html";
// import * as ts from "./src/verify.tsx";

// console.log("html", html.length);
// console.log("ts", ts.length);

// bun build src/*.html --outdir dist/web --target browser --minify --inline
async function build() {
  console.log("🔄 Building...");

  // do not chunk
  await Bun.build({
    entrypoints: ["./src/verify.html"],
    outdir: "./dist/web",
    target: "browser",
    format: "esm",
    minify: false,
    splitting: false,
    define: {
      global: "window",
      "process.env.READABLE_STREAM": "null",
    },
  });

  await $`bun run build:inline-scripts`;
  console.log("✅ Build completed!");
}

// Initial build
await build();

// Watch src directory
console.log("👀 Watching ./src for changes...");
watch("./src", { recursive: true }, async (eventType, filename) => {
  console.log(`📝 ${filename} changed`);
  await build();
});
