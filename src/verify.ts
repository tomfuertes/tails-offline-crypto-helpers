console.log("Hello, world!");

document.addEventListener("DOMContentLoaded", () => {
  const $h1 = document.querySelector("h1");
  console.log($h1);
  if ($h1) {
    $h1.textContent = "Hello, world!";
  }
});
