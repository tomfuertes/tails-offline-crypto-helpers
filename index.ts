import { input } from "@inquirer/prompts";

console.log("Hello via Bun!");

// prompt for a string of random dice
const digits = await input({
  message: "Enter a string of random digits",
});

// convert the string to an array of numbers
const numbers = digits?.split("").map(Number) || [];

// print the numbers
console.log(numbers);

// print the sum of the numbers
console.log(numbers.reduce((a, b) => a + b, 0));
