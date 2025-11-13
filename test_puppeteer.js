import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://example.com");
  console.log("✅ Puppeteer launched and loaded example.com");
  await browser.close();
})();
