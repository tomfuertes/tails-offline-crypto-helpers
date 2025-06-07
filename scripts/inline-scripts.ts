#!/usr/bin/env bun

import { readdir, readFile, writeFile } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

const DIST_WEB_DIR = "./dist/web";

async function inlineScripts() {
  try {
    // Read all files in the dist/web directory
    const files = await readdir(DIST_WEB_DIR);

    // Filter for HTML files
    const htmlFiles = files.filter((file) => extname(file) === ".html");

    console.log(`Found ${htmlFiles.length} HTML files to process`);

    for (const htmlFile of htmlFiles) {
      const htmlPath = join(DIST_WEB_DIR, htmlFile);
      const htmlContent = await readFile(htmlPath, "utf-8");

      console.log(`Processing ${htmlFile}...`);

      // Regex to match script tags with type="module" and src attributes (flexible order)
      // Matches various combinations like:
      // <script type="module" crossorigin src="./file.js"></script>
      // <script crossorigin type="module" src="./file.js"></script>
      // <script type="module" src="./file.js" crossorigin></script>
      const scriptRegex =
        /<script\s+(?=.*type=["']module["'])(?=.*src=["']\.\/([^"']+\.js)["'])[^>]*><\/script>/g;

      let modifiedContent = htmlContent;
      let match;
      let hasInlinedScripts = false;

      // Find all script tags that match the pattern
      while ((match = scriptRegex.exec(htmlContent)) !== null) {
        const fullMatch = match[0];
        // Extract the filename from the src attribute
        const srcMatch = fullMatch.match(/src=["']\.\/([^"']+\.js)["']/);
        if (!srcMatch) continue;
        const scriptFileName = srcMatch[1];
        if (!scriptFileName) continue;
        console.log(`  Found script reference: ${scriptFileName}`);
        const scriptPath = join(DIST_WEB_DIR, scriptFileName);

        // Check if the script file exists
        if (existsSync(scriptPath)) {
          try {
            // Read the script file content
            const scriptContent = await readFile(scriptPath, "utf-8");

            // Create the inline script tag
            const inlineScript = `<script type="module">${scriptContent}</script>`;

            // Replace the external script reference with inline content
            modifiedContent = modifiedContent.replace(fullMatch, inlineScript);
            hasInlinedScripts = true;

            console.log(`  ✓ Inlined ${scriptFileName}`);
          } catch (error) {
            console.error(
              `  ✗ Error reading script file ${scriptFileName}:`,
              error
            );
          }
        } else {
          console.warn(`  ⚠ Script file not found: ${scriptFileName}`);
        }
      }

      if (hasInlinedScripts) {
        // Write the modified content back to the original file
        await writeFile(htmlPath, modifiedContent, "utf-8");
        console.log(`  ✓ Updated ${htmlFile} with inlined scripts`);
      } else {
        console.log(`  - No scripts to inline in ${htmlFile}`);
      }
    }

    console.log("\n✅ Script inlining completed!");
  } catch (error) {
    console.error("❌ Error during script inlining:", error);
    process.exit(1);
  }
}

// Run the script
inlineScripts();
