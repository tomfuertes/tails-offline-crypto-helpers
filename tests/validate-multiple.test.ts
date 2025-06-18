// hello world test with bun

import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { readFileSync } from "fs";
import { join } from "path";

test("2 + 2", () => {
  expect(2 + 2).toBe(4);
});

const EXAMPLE_MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

test("ian-bip39.html generates correct output for example mnemonic", async () => {
  // todo: playwright instead of happy-dom
  // Load the HTML file
  const htmlPath = join(process.cwd(), "dist/resources/ian-bip39.html");
  const htmlContent = readFileSync(htmlPath, "utf-8");

  // Create a new window with happy-dom and enable JavaScript
  const window = new Window({
    url: "http://localhost",
    settings: {
      disableJavaScriptEvaluation: false,
      disableJavaScriptFileLoading: false,
      disableCSSFileLoading: true,
      disableIframePageLoading: true,
      disableComputedStyleRendering: true,
    },
  });
  const document = window.document;

  // Load the HTML content properly
  document.write(htmlContent);

  // Wait for scripts to load and execute
  await window.happyDOM.waitUntilComplete();

  // Find the phrase input
  const phraseInput = document.getElementById("phrase") as HTMLTextAreaElement;

  expect(phraseInput).toBeTruthy();

  // Insert the example mnemonic into the phrase input
  phraseInput.value = EXAMPLE_MNEMONIC;

  // Trigger input event to simulate user typing
  const inputEvent = new window.Event("input", { bubbles: true });
  phraseInput.dispatchEvent(inputEvent);

  // Also try change event
  const changeEvent = new window.Event("change", { bubbles: true });
  phraseInput.dispatchEvent(changeEvent);

  // Wait longer for any async operations
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Debug: Check what elements exist
  const tableElement = document.getElementById("table");
  console.log("Table element exists:", !!tableElement);

  if (tableElement) {
    const tableRows = tableElement.querySelectorAll("tr");
    console.log("Number of table rows:", tableRows.length);

    const addressCells = tableElement.querySelectorAll("td.address");
    console.log("Number of address cells:", addressCells.length);

    if (addressCells.length > 0) {
      console.log("First address cell content:", addressCells[0].textContent);
    }
  }

  // Check for the specific address element
  const addressElement = document.querySelector(
    "#table > div > table > tbody > tr:nth-child(1) > td.address > span"
  ) as HTMLElement;

  expect(addressElement).toBeTruthy();
  expect(addressElement.textContent).toBe("1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA");

  // Clean up
  window.close();
});
