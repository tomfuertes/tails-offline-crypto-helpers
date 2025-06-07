// import { $ } from "bun";
import { fetch } from "bun";
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "fs";
import { readFile, writeFile } from "fs/promises";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Echo about to download and give build a change to abort
 * - only if not on ci
 */
if (!process.env.CI) {
  console.log("About to download and give build a change to abort");
  const answer = prompt("Continue? (y/N)");
  console.log("answer", answer);
  if (!answer || answer.toLowerCase() === "n") {
    throw new Error("Aborted");
  }
}

const DIST_FOLDER = "dist/prebuilt-resources/";
// clean up the dist folder if it exists
if (existsSync(DIST_FOLDER)) {
  rmSync(DIST_FOLDER);
  await sleep(50);
}
mkdirSync(DIST_FOLDER, { recursive: true });
await sleep(50);

let lastCall = new Date();
const minTimeBetweenDownloads = 250;
const throttle = async () => {
  const now = new Date();
  if (now.getTime() - lastCall.getTime() < minTimeBetweenDownloads) {
    await sleep(minTimeBetweenDownloads - (now.getTime() - lastCall.getTime()));
  }
  lastCall = new Date();
};

const downloadText = async (filename: string, url: string) => {
  await throttle();
  console.log(`Downloading ${filename} from ${url}`);
  const response = await fetch(url);
  const data = await response.text();
  // if filename is a directory, create it
  if (filename.includes("/")) {
    const dir = filename.split("/").slice(0, -1).join("/");
    mkdirSync(DIST_FOLDER + dir, { recursive: true });
  }
  await writeFile(DIST_FOLDER + filename, data);

  // sanity check file for success
  if (!existsSync(DIST_FOLDER + filename)) {
    throw new Error(`Failed to download ${filename}`);
  }
  // also check size not null or 0
  const stats = statSync(DIST_FOLDER + filename);
  if (stats.size === 0) {
    throw new Error(`Failed to download ${filename}`);
  }
  if (filename.endsWith(".html")) {
    // also check text like html
    const text = await readFile(DIST_FOLDER + filename, "utf8");
    if (!text.trim().match(/^<!DOCTYPE html>/i)) {
      throw new Error(
        `Failed to download ${filename} - not html: ${text
          .trim()
          .slice(0, 100)}`
      );
    }
  } else if (filename.endsWith(".txt")) {
    // also check text like txt
    const text = await readFile(DIST_FOLDER + filename, "utf8");
    // Check that the file contains readable text (not binary) and has some content
    if (!text.trim() || text.includes("\0")) {
      throw new Error(
        `Failed to download ${filename} - not valid text: ${text
          .trim()
          .slice(0, 100)}`
      );
    }
  } else if (filename.endsWith(".js")) {
    // also check js
    const text = await readFile(DIST_FOLDER + filename, "utf8");
    if (!text.trim().match(/(function|require|import)/i)) {
      throw new Error(
        `Failed to download ${filename} - not valid js: ${text
          .trim()
          .slice(0, 100)}`
      );
    }
  }
  // console.log(`Downloaded ${filename}`);
  lastCall = new Date();
};

const downloadBinary = async (filename: string, url: string) => {
  await throttle();
  const now = new Date();
  if (now.getTime() - lastCall.getTime() < minTimeBetweenDownloads) {
    await sleep(minTimeBetweenDownloads - (now.getTime() - lastCall.getTime()));
  }
  console.log(`Downloading ${filename} from ${url}`);
  const response = await fetch(url);
  const data = await response.arrayBuffer();
  if (filename.includes("/")) {
    const dir = filename.split("/").slice(0, -1).join("/");
    mkdirSync(DIST_FOLDER + dir, { recursive: true });
  }
  await writeFile(DIST_FOLDER + filename, new Uint8Array(data));
  // sanity check file for success
  if (!existsSync(DIST_FOLDER + filename)) {
    throw new Error(`Failed to download ${filename}`);
  }
  // also check size not null or 0
  const stats = statSync(DIST_FOLDER + filename);
  if (stats.size === 0) {
    throw new Error(`Failed to download ${filename}`);
  }
  // also check binary
  const buffer = await readFile(DIST_FOLDER + filename);
  if (buffer.length === 0) {
    throw new Error(`Failed to download ${filename}`);
  }
  // console.log(`Downloaded ${filename}`);
  lastCall = new Date();
};

const SIMPLE_FILES = {
  "bitaps-mnemonic-offline-tool.html":
    "https://raw.githubusercontent.com/bitaps-com/mnemonic-offline-tool/master/index.html",

  "thisbetom-dice-roll-calculator.html":
    "https://raw.githubusercontent.com/tomfuertes/tails-offline-keygen/refs/heads/main/dist/index.html",

  // echo "Downloading Ian Coleman BIP39"
  // wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition https://github.com/iancoleman/bip39/releases/latest/download/bip39-standalone.html
  // mv bip39-standalone.html ian-bip39.html
  "ian-bip39.html":
    "https://github.com/iancoleman/bip39/releases/latest/download/bip39-standalone.html",

  // echo "Downloading Ian Coleman Shamir"
  // curl -s -o ian-shamir.html https://iancoleman.io/shamir/
  "ian-shamir.html": "https://iancoleman.io/shamir/",

  // echo "Downloading Ian Coleman Shamir39"
  // curl -s -o ian-shamir39.html https://iancoleman.io/shamir39/
  "ian-shamir39.html": "https://iancoleman.io/shamir39/",

  // echo "Downloading Ian Coleman Slip39"
  // curl -s -o ian-slip39.html https://iancoleman.io/slip39/
  "ian-slip39.html": "https://iancoleman.io/slip39/",

  // echo "Downloading Ian Coleman EIP2333"
  // curl -s -o ian-eip2333.html https://iancoleman.io/eip2333/
  "ian-eip2333.html": "https://iancoleman.io/eip2333/",

  // echo "Downloading ThisBeTom Slip39"
  // curl -s -o tom-slip39.html https://tomfuertes.github.io/tails-offline-keygen/

  "tom-slip39.html": "https://tomfuertes.github.io/tails-offline-keygen/",

  // echo "Downloading BIP39 Words"
  // curl -s -o wordlist-bip39.txt https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt

  "wordlist-bip39.txt":
    "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt",

  // echo "Downloading Slip39 Words"
  // curl -s -o wordlist-slip39.txt https://raw.githubusercontent.com/satoshilabs/slips/master/slip-0039/wordlist.txt

  "wordlist-slip39.txt":
    "https://raw.githubusercontent.com/satoshilabs/slips/master/slip-0039/wordlist.txt",

  // echo "Slip39-JS-Playground"
  // curl -s -o tom-slip39-playground.html https://raw.githubusercontent.com/tomfuertes/slip39-js-playground/main/dist/main.html

  "tom-slip39-playground.html":
    "https://raw.githubusercontent.com/tomfuertes/slip39-js-playground/main/dist/main.html",

  // echo "Slip39-JS Offline"
  // curl -s -o tom-slip39-offline.js https://raw.githubusercontent.com/tomfuertes/slip39-js-playground/main/offline.js

  "tom-slip39-offline.js":
    "https://raw.githubusercontent.com/tomfuertes/slip39-js-playground/main/offline.js",

  // echo "Perta Slip39JS Hosted"
  // curl -s -o petra-slip39.html https://3rditeration.github.io/slip39/src/
  // mkdir -p js
  // cd js || exit
  // wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition  https://3rditeration.github.io/slip39/src/js/jquery-3.2.1.js
  // wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition  https://3rditeration.github.io/slip39/src/js/slip39-libs.js
  // wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition  https://3rditeration.github.io/slip39/src/js/index.js
  // cd ../
  "petra-slip39/index.html": "https://3rditeration.github.io/slip39/src/",

  "petra-slip39/js/jquery-3.2.1.js":
    "https://3rditeration.github.io/slip39/src/js/jquery-3.2.1.js",
  "petra-slip39/js/slip39-libs.js":
    "https://3rditeration.github.io/slip39/src/js/slip39-libs.js",
  "petra-slip39/js/index.js":
    "https://3rditeration.github.io/slip39/src/js/index.js",
};

// await them in series via for of
for (const [filename, url] of Object.entries(SIMPLE_FILES)) {
  await downloadText(filename, url);
}

const releaseData = async (org: string, repo: string) => {
  const response = await fetch(
    `https://api.github.com/repos/${org}/${repo}/releases/latest`
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await response.json()) as unknown as any;
  return json;
};

// # echo "Downloading Staking CLI"
// # wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition https://github.com/ethereum/staking-deposit-cli/releases/latest/download/staking_deposit-cli-fdab65d-linux-amd64.tar.gz
await (async () => {
  const json = await releaseData("ethereum", "staking-deposit-cli");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asset = json.assets.find((asset: any) =>
    asset.name.includes("linux-amd64.tar.gz")
  );
  if (!asset) {
    throw new Error("No asset found for ethereum/staking-deposit-cli");
  }
  const download_url = asset.browser_download_url;
  const filename = asset.name;
  if (
    !download_url ||
    !filename ||
    !filename.match(/^staking_deposit-cli-.*-linux-amd64\.tar\.gz$/)
  ) {
    throw new Error("No download URL found for ethereum/staking-deposit-cli");
  }
  await downloadBinary("ethereum/" + filename, download_url);
})();

// echo "Download RocketPool"
// wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition https://github.com/rocket-pool/smartnode-install/releases/latest/download/rocketpool-cli-linux-amd64

await (async () => {
  // await downloadReleases(
  // "rocket-pool",
  // "smartnode-install",
  // "rocketpool-cli-linux-amd64"
  const match = /^rocketpool-cli-linux-amd64$/;
  const json = await releaseData("rocket-pool", "smartnode-install");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asset = json.assets.find((asset: any) => asset.name.match(match));
  if (!asset) {
    throw new Error("No asset found for rocket-pool/smartnode-install");
  }
  const download_url = asset.browser_download_url;
  const filename = asset.name;
  if (!download_url || !filename || !filename.match()) {
    throw new Error("No download URL found for rocket-pool/smartnode-install");
  }
  await downloadBinary("rocket-pool/" + filename, download_url);
})();

// # echo "Download wagyu"
// # curl -s https://wagyu.gg/ | grep -o 'href="[^"]*\.AppImage"' | sed 's/href="//;s/"$//' | while read -r link; do curl -O "$link"; done
await (async () => {
  const response = await fetch("https://wagyu.gg/");
  const text = await response.text();
  const links = text.match(/href="([^"]*\.AppImage)"/g);
  if (!links) {
    throw new Error("No links found on wagyu.gg");
  }
  for (const _link of links) {
    const link = _link.replace(/^href="([^"]*)"$/, "$1");
    const filename = link.split("/").pop();
    if (!filename) {
      throw new Error("No filename found on wagyu.gg");
    }
    await downloadBinary("wagyu/" + filename, link);
  }
})();

// # echo "Downloading Node.js"
// # curl -s -O https://nodejs.org/download/release/latest/$(curl -s https://nodejs.org/download/release/latest/ | grep -oE 'node-v[0-9]+\.[0-9]+\.[0-9]+-linux-x64\.tar\.xz' | head -n 1)

await (async () => {
  const response = await fetch("https://nodejs.org/download/release/latest/");
  const text = await response.text();
  const links = text.match(/href="([^"]*linux-x64\.tar\.xz)"/g);
  if (!links) {
    throw new Error("No links found on nodejs.org");
  }
  for (const _link of links) {
    const link = _link.replace(/^href="([^"]*)"$/, "$1");
    const filename = link.split("/").pop();
    if (!filename) {
      throw new Error("No filename found on nodejs.org");
    }
    await downloadBinary(
      "nodejs/" + filename,
      "https://nodejs.org/download/release/latest/" + filename
    );
  }
})();

// # echo "Downloading solana"
// # wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition https://github.com/solana-labs/solana/releases/latest/download/solana-release-x86_64-unknown-linux-gnu.tar.bz2
await downloadBinary(
  "solana/solana-release-x86_64-unknown-linux-gnu.tar.bz2",
  "https://github.com/solana-labs/solana/releases/latest/download/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
);

// echo "Slip39-JS-v0.1.9"
// wget -q --show-progress --max-redirect=20 --no-server-response --content-disposition https://github.com/ilap/slip39-js/archive/refs/tags/v0.1.9.tar.gz
// npm view slip39 | grep latest
await (async () => {
  const json = await releaseData("ilap", "slip39-js");
  const download_url = json.tarball_url;
  const tag_name = json.tag_name;
  if (!download_url || !tag_name || !tag_name.match(/^v\d+\.\d+\.\d+$/)) {
    throw new Error(
      "No download URL or tag name found on github.com/ilap/slip39-js"
    );
  }
  await downloadBinary("ilap/slip39-js-" + tag_name + ".tar.gz", download_url);
})();

// pointbiz/bitaddress.org
await (async () => {
  const json = await releaseData("pointbiz", "bitaddress.org");
  const download_url = json.tarball_url;
  const tag_name = json.tag_name;
  if (!download_url || !tag_name || !tag_name.match(/^v\d+\.\d+\.\d+$/)) {
    throw new Error(
      "No download URL or tag name found on github.com/ilap/slip39-js"
    );
  }
  await downloadBinary(
    "pointbiz/bitaddress.org-" + tag_name + ".tar.gz",
    download_url
  );
})();

// paperwallet.bitcoin.com
await downloadBinary(
  "paperwallet.bitcoin.com/paperwallet.zip",
  "https://github.com/Bitcoin-com/paperwallet.bitcoin.com/archive/master.zip"
);

// finally console.table over all files with some stats
const files = readdirSync(DIST_FOLDER, {
  withFileTypes: true,
  recursive: true,
});
const summary = [];
for (const file of files) {
  // skip if it's a directory
  if (file.isDirectory()) {
    continue;
  }
  const size = statSync(file.parentPath + "/" + file.name).size;
  const size_kb = parseFloat((size / 1024).toFixed(2));
  const size_mb = parseFloat((size / 1024 / 1024).toFixed(2));
  const filename = file.name;

  let first100 = "";
  try {
    const text = await readFile(file.parentPath + "/" + file.name, "utf8");
    first100 = text
      .trim()
      .replace(/^[^\S]+/, "")
      .replace(/\n+$/, " ")
      .replace(/\s+/g, " ")
      .slice(0, 50);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // If it's a binary file, reading as utf8 might fail
    first100 = "[binary file]";
  }

  const type = (() => {
    if (filename.endsWith(".html")) {
      return "html";
    } else if (filename.endsWith(".txt")) {
      return "txt";
    } else if (filename.endsWith(".js")) {
      return "js";
    } else {
      return "binary";
    }
  })();

  summary.push({
    name: filename,
    size_kb,
    size_mb,
    type,
    first100,
  });
}
summary.sort((a, b) => b.size_kb - a.size_kb);
console.table(summary);
