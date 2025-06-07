#!/usr/bin/env bun

import { existsSync, mkdirSync, rmSync } from "fs";
import { cp } from "fs/promises";
import { $ } from "bun";

const RESOURCES_FOLDER = "./resources/";
const DIST_RESOURCES_FOLDER = "./dist/resources/";

async function copyResources() {
  try {
    // Check if resources folder exists
    if (!existsSync(RESOURCES_FOLDER)) {
      console.log(
        "📥 Resources folder doesn't exist, downloading resources..."
      );
      console.log("This may take a while and requires user confirmation.");

      // Run the download script
      await $`bun run build:resources-download`;

      if (!existsSync(RESOURCES_FOLDER)) {
        throw new Error(
          "Resources download failed - resources folder still doesn't exist"
        );
      }

      console.log("✅ Resources downloaded successfully!");
    } else {
      console.log("📁 Resources folder exists, skipping download");
    }

    // Clean up the dist resources folder if it exists
    if (existsSync(DIST_RESOURCES_FOLDER)) {
      console.log("🧹 Cleaning existing dist/resources folder...");
      rmSync(DIST_RESOURCES_FOLDER, { recursive: true });
    }

    // Create the dist/resources directory
    mkdirSync(DIST_RESOURCES_FOLDER, { recursive: true });

    // Copy all contents from resources to dist/resources
    console.log("📋 Copying resources to dist/resources...");
    await cp(RESOURCES_FOLDER, DIST_RESOURCES_FOLDER, {
      recursive: true,
      force: true,
    });

    console.log("✅ Resources copied successfully!");

    // Show summary of what was copied
    const { stdout } =
      await $`find ${DIST_RESOURCES_FOLDER} -type f | wc -l`.quiet();
    const fileCount = stdout.toString().trim();
    console.log(`📊 Copied ${fileCount} files to dist/resources/`);
  } catch (error) {
    console.error("❌ Error during resource copying:", error);
    process.exit(1);
  }
}

// Run the script
copyResources();
